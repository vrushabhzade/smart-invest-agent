import time
from collections import deque

class GeminiRateLimiter:
    """
    Ensure we stay within Gemini free tier limits:
    - 15 RPM (requests per minute)
    - 1 million tokens/day
    - 32,000 tokens per minute
    """

    def __init__(self, rpm_limit: int = 14):  # 14 to be safe
        self.rpm_limit = rpm_limit
        self.requests = deque()

    def wait_if_needed(self):
        """Block until we can safely make another request"""
        now = time.time()

        # Remove requests older than 60 seconds
        while self.requests and self.requests[0] < now - 60:
            self.requests.popleft()

        # If at limit, wait
        if len(self.requests) >= self.rpm_limit:
            wait_time = 60 - (now - self.requests[0])
            if wait_time > 0:
                print(f"⏳ Rate limit: waiting {wait_time:.1f}s")
                time.sleep(wait_time)

        self.requests.append(time.time())

# Usage — wrap all Gemini calls
rate_limiter = GeminiRateLimiter()

def safe_gemini_call(model, prompt):
    rate_limiter.wait_if_needed()
    return model.generate_content(prompt)
