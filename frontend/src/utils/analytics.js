/**
 * Analytics and error tracking utility
 * In production, integrate with services like Sentry, LogRocket, etc.
 */

class Analytics {
  constructor() {
    this.enabled = import.meta.env.PROD
    this.errors = []
  }

  /**
   * Track an error
   * @param {Error} error - Error object
   * @param {object} context - Additional context
   */
  trackError(error, context = {}) {
    const errorEvent = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      context,
      userAgent: navigator.userAgent,
      url: window.location.href,
    }

    this.errors.push(errorEvent)

    // In production, send to error tracking service
    if (this.enabled) {
      // Example: Sentry.captureException(error, { extra: context })
      console.error('[Analytics] Error tracked:', errorEvent)
    } else {
      console.error('[Analytics] Error:', errorEvent)
    }
  }

  /**
   * Track an event
   * @param {string} eventName - Event name
   * @param {object} properties - Event properties
   */
  trackEvent(eventName, properties = {}) {
    const event = {
      name: eventName,
      properties,
      timestamp: new Date().toISOString(),
    }

    // In production, send to analytics service
    if (this.enabled) {
      // Example: analytics.track(eventName, properties)
      console.log('[Analytics] Event:', event)
    }
  }

  /**
   * Track page view
   * @param {string} path - Page path
   */
  trackPageView(path) {
    this.trackEvent('page_view', { path })
  }

  /**
   * Get error logs (for debugging)
   * @returns {Array} Array of error events
   */
  getErrors() {
    return this.errors
  }

  /**
   * Clear error logs
   */
  clearErrors() {
    this.errors = []
  }
}

// Export singleton instance
export const analytics = new Analytics()

// Export class for custom instances
export default Analytics

