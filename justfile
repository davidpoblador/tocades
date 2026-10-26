# ABOUTME: Task runner for the word clock. `just site` stages the files that are
# ABOUTME: served into public/, which wrangler.jsonc publishes as static assets.

# Stage the hand-written page; there is no build step.
site:
    rm -rf public
    mkdir -p public
    cp index.html clock.js styles.css _headers public/

# Serve the page locally at http://localhost:8765/.
serve:
    python3 -m http.server 8765
