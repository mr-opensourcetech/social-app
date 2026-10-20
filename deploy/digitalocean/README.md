# DigitalOcean production deployment

This deploys only the production `social-app` web client and its Go web server.
Accounts, posts, feeds, and messages use the existing public Bluesky services.
It does not deploy `oursky-demo`, the AT Protocol test network, PostgreSQL,
Redis, Supabase, or seeded accounts.

## Server

- Ubuntu 24.04, Basic Regular CPU, 1 vCPU / 1 GiB RAM / 25 GiB disk.
- Build on GitHub Actions, not on the 1 GiB server.
- Caddy terminates HTTPS. Only SSH, HTTP, and HTTPS are exposed.
- The web server runs as `bluesky`, bound to loopback with a memory limit.
- `deploy` owns release files and can restart only `bskyweb.service` via sudo.
- No paid backup, database, storage, or load-balancer add-ons are required by
  this configuration. Monitor bandwidth and billing separately.

Run `bootstrap.sh <hostname>` as root with this directory present. Point the
hostname at the Droplet before checking HTTPS. Install a dedicated SSH public
key in `/home/deploy/.ssh/authorized_keys` with restrictive permissions;
never commit private keys. Keep separate administrative access.

## GitHub delivery

Create a `production` GitHub environment with a required reviewer before
enabling deployment. Configure these environment values:

| Name | Kind | Purpose |
| --- | --- | --- |
| `DO_DEPLOY_HOST` | Variable | Server IP or hostname, no scheme |
| `DO_APP_URL` | Variable | Full HTTPS URL |
| `DO_DEPLOY_SSH_KEY` | Secret | Dedicated deployment SSH private key |
| `DO_KNOWN_HOSTS` | Secret | Verified server SSH host-key entry |

GitHub builds the production bundle and Go server, runs Go tests, then uploads
a commit-specific artifact. Deployment runs only from `main`, after the build
passes and the GitHub environment approval is granted. PRs build but cannot
deploy. The workflow needs to be merged before it becomes the normal release
path; the initial deployment can use the same tested binary and activation
script without merging infrastructure changes automatically.

Require normal application CI and PR review through branch protection as well;
the environment gate does not replace source review.

## Release and rollback

Upload `bskyweb` and its SHA256SUMS file into
`/opt/bluesky/releases/<full-git-commit>/`, verify the checksum and executable
mode, then run `activate-release.sh <full-git-commit>` as `deploy`.

Activation atomically switches the `current` symlink and restarts the service.
If the local health check fails, it restores and checks the previous release.
An external HTTPS failure marks the workflow failed and needs investigation;
it does not automatically prove the application binary needs rollback.

Older release directories are retained for explicit rollback. Monitor disk
usage and remove only releases no longer referenced by `current` or needed
for rollback.

Check `journalctl -u bskyweb -u caddy`, the public URL, and real account sign-in
after deployment. Never log session tokens or paste user passwords into CI.
