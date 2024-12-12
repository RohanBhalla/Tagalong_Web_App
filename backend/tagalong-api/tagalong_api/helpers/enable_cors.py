from tg import response

def enable_cors():
    """
    Set CORS headers in the response.
    """
    response.headers['Access-Control-Allow-Origin'] = '*'  # This allows any origin. In a real-world scenario, you'd probably limit this.
    response.headers['Access-Control-Allow-Methods'] = 'POST, GET, PUT, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token, Authorization'