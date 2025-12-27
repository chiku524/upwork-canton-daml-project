# AMM Design: DVP Transfer Workflows

## Overview

When designing the Automated Market Maker (AMM) for prediction market liquidity, we must follow the **CIP-0056 Canton Network Token Standard** for Delivery versus Payment (DVP) transfer workflows.

## Reference

**CIP-0056**: [Canton Network Token Standard](https://github.com/global-synchronizer-foundation/cips/blob/main/cip-0056/cip-0056.md#delivery-versus-payment-dvp-transfer-workflows)

## Key Requirements for AMM Design

### DVP Transfer Workflow Principles

1. **Atomic Settlement**: Multiple asset transfers must execute as part of a single Daml transaction in an all-or-nothing fashion
   - Either all transfers settle or none of them do
   - This ensures no partial settlements in AMM trades

2. **Allocation-Based Model**: 
   - Users allocate their asset holdings to a settlement request for a fixed amount of time
   - Once all allocations required for a settlement are present, the AMM submits a single Daml transaction that triggers all transfers
   - Allocations have deadlines - assets are only locked until the deadline

3. **Workflow Steps**:
   ```
   1. User initiates trade via AMM app
   2. User sees requested asset allocation in wallet
   3. User uses wallet to create Daml transaction instructing registry to create allocation
   4. AMM observes allocation creation on validator node
   5. AMM checks if all allocations for settlement are present
   6. If yes, AMM submits transaction that completes settlement (executes all transfers)
   ```

### Design Implications for AMM

#### 1. Liquidity Pool Structure
- **Liquidity pools** must support allocation-based transfers
- Pool contracts need to track pending allocations
- Pool must verify all required allocations before executing trades

#### 2. Trade Execution Flow
- **Step 1**: User requests trade (e.g., buy YES shares for 100 CC)
- **Step 2**: AMM creates settlement request requiring:
  - User's allocation of 100 CC
  - Pool's allocation of corresponding YES shares
- **Step 3**: User's wallet creates allocation for 100 CC
- **Step 4**: Pool creates allocation for YES shares
- **Step 5**: AMM observes both allocations and submits atomic settlement transaction
- **Step 6**: All transfers execute atomically

#### 3. Deadline Management
- All settlements must specify deadlines
- Allocations are only valid until deadline
- Assets become available again after deadline if settlement doesn't complete
- AMM must handle failed settlements (retry or implement punitive actions)

#### 4. Multi-Asset Trades
- AMM trades may involve multiple assets (e.g., CC + stablecoin)
- All asset allocations must be present before settlement
- Single transaction executes all transfers atomically

#### 5. Privacy Considerations
- Allocation information shared on need-to-know basis
- Pool contracts maintain privacy of individual allocations
- Only aggregate pool state is public

## Implementation Notes

### Registry APIs Required

The AMM must implement or interact with:

1. **Allocation API**: Create allocations for settlement requests
2. **Settlement API**: Submit settlement transactions when all allocations are present
3. **Query API**: Check status of allocations and settlements

### Integration Points

- **Wallet Integration**: AMM must work with wallets that support CIP-0056 DVP workflows
- **Pool Contracts**: Must implement allocation tracking and atomic settlement
- **Settlement App**: AMM acts as settlement app coordinating multi-party transfers

## Example AMM Trade Flow

```
User wants to buy 50 YES shares at current market price (100 CC)

1. AMM calculates: 50 YES shares = 100 CC (based on current pool ratio)
2. AMM creates SettlementRequest:
   - Requires: User allocates 100 CC
   - Requires: Pool allocates 50 YES shares
   - Deadline: 5 minutes
3. User's wallet shows allocation request for 100 CC
4. User approves → Wallet creates allocation contract
5. Pool automatically creates allocation for 50 YES shares
6. AMM observes both allocations exist
7. AMM submits settlement transaction:
   - Transfers 100 CC from user to pool
   - Transfers 50 YES shares from pool to user
   - Updates pool state atomically
8. Settlement completes, allocations archived
```

## Benefits for Prediction Markets

1. **No Partial Executions**: Trades either complete fully or not at all
2. **Reduced Risk**: Users' assets are only locked for settlement duration
3. **Multi-Asset Support**: Can handle complex trades involving multiple tokens
4. **Privacy Preserved**: Allocation details remain private
5. **Standard Compliance**: Works with any CIP-0056 compliant wallet

## Next Steps

1. Design AMM pool contracts with allocation support
2. Implement settlement coordination logic
3. Integrate with wallet clients supporting CIP-0056
4. Test atomic settlement with multiple parties
5. Handle deadline expiration and retry logic

## References

- [CIP-0056 Full Specification](https://github.com/global-synchronizer-foundation/cips/blob/main/cip-0056/cip-0056.md)
- [Canton Network Token Standard Implementation](https://docs.dev.sync.global/app_dev/token_standard/index.html)

