#!/usr/bin/env bash

set -euo pipefail

FORK_URL="https://github.com/clintandrewhall/kibana.git"
FORK_BRANCH="exploration/scout-vrt"
LOCAL_TEMP_BRANCH="scout-vrt-temp"
WORK_BRANCH="scout-vrt-work"

usage() {
  cat <<'EOF'
Usage:
  scripts/scout-vrt.sh [<sha>]      Apply exploration/scout-vrt changes onto the given SHA (or current HEAD if omitted) and run yarn kbn bootstrap
  scripts/scout-vrt.sh --reset      Abort in-progress merge (if any), cleanly reset to main tracking origin/main and remove temp branches
  scripts/scout-vrt.sh test [--filter <string>]... [--stateful | --serverless=<es|oblt|security> | --all]

Details:
  - Fetches branch exploration/scout-vrt from fork:
      https://github.com/clintandrewhall/kibana
  - Creates/updates local branch:
      scout-vrt-temp        (tracks fetched branch)
  - If a SHA is provided, checks out a new work branch at that SHA:
      scout-vrt-work
    Otherwise applies on the current branch/HEAD.
  - Applies the overlay (uncommitted), then runs: yarn kbn bootstrap

Notes:
  - Working directory must be clean before applying.
  - On conflicts during overlay application, resolve or discard with 'git reset --hard'.
  - 'test' discovers Playwright configs via 'node scripts/scout discover-playwright-configs' and runs each with 'node scripts/scout run-tests'.
    - Passes: '--stateful' (default) or '--serverless=<es|oblt|security>' or '--all' to run all of them.
    - Sets env per run: SCOUT_VISUAL_REGRESSION_ENABLED=true
    - Use one or more '--filter' flags to include configs whose path includes any of the given strings (e.g. 'discover', 'streams'). You can also pass a comma-separated list to a single '--filter'.
EOF
}

ensure_repo_root() {
  if [ ! -f "package.json" ] || [ ! -d ".git" ]; then
    echo "Error: Run this script from the Kibana repo root." >&2
    exit 1
  fi
}

ensure_clean_tree() {
  if [ -n "$(git status --porcelain)" ]; then
    echo "Error: Working tree is not clean. Commit/stash/discard changes and try again." >&2
    exit 1
  fi
}

reset_to_main() {
  ensure_repo_root
  echo "Aborting any in-progress merge (if any)..."
  git merge --abort 2>/dev/null || true

  echo "Discarding uncommitted changes and untracked files..."
  git reset --hard 2>/dev/null || true
  git clean -fd 2>/dev/null || true

  echo "Fetching origin main..."
  git fetch origin main --prune

  echo "Checking out main..."
  if git show-ref --verify --quiet refs/heads/main; then
    git checkout main
  else
    git checkout -b main origin/main
  fi

  echo "Hard resetting main to origin/main..."
  git reset --hard origin/main

  echo "Removing temporary branches (if they exist)..."
  git branch -D "${LOCAL_TEMP_BRANCH}" 2>/dev/null || true
  git branch -D "${WORK_BRANCH}" 2>/dev/null || true

  echo "Done. Repository is on main."
}

apply_scout_vrt() {
  local sha="${1:-}"
  ensure_repo_root
  ensure_clean_tree

  echo "Fetching ${FORK_BRANCH} from ${FORK_URL}..."
  git fetch "${FORK_URL}" "${FORK_BRANCH}:${LOCAL_TEMP_BRANCH}"

  echo "Fetching origin/main to determine diff base..."
  git fetch origin main --prune

  echo "Computing merge-base between ${LOCAL_TEMP_BRANCH} and origin/main..."
  local merge_base
  if ! merge_base=$(git merge-base "${LOCAL_TEMP_BRANCH}" origin/main); then
    echo "Error: Unable to compute merge-base with origin/main" >&2
    exit 1
  fi

  echo "Creating patch of changes unique to ${FORK_BRANCH}..."
  local tmp_patch
  tmp_patch=$(mktemp -t scout_vrt_patch.XXXXXX)
  git diff --binary "${merge_base}" "${LOCAL_TEMP_BRANCH}" > "${tmp_patch}"

  if [ ! -s "${tmp_patch}" ]; then
    echo "No changes to apply from ${FORK_BRANCH} relative to origin/main."
    rm -f "${tmp_patch}"
    return 0
  fi

  if [ -n "$sha" ]; then
    echo "Checking out work branch ${WORK_BRANCH} at ${sha}..."
    git checkout -B "${WORK_BRANCH}" "${sha}"
  else
    echo "No SHA provided. Applying overlay onto current branch: $(git rev-parse --abbrev-ref HEAD)"
  fi

  echo "Applying patch (3-way, no commit) onto ${WORK_BRANCH}..."
  if ! git apply -3 "${tmp_patch}"; then
    echo "Patch application resulted in conflicts. Resolve or run 'git reset --hard' to discard."
    rm -f "${tmp_patch}"
    exit 1
  fi

  rm -f "${tmp_patch}"

  echo "Running yarn kbn bootstrap..."
  yarn kbn bootstrap

  echo "Done. You are on branch ${WORK_BRANCH} with ${FORK_BRANCH} changes applied to ${sha}."
}

run_tests_command() {
  ensure_repo_root

  local -a filters=()
  local server_mode="stateful" # values: stateful | serverless=es|oblt|security | all
  local grep_tag="@ess"         # values: @ess | @svlSearch | @svlOblt | @svlSecurity | all
  local run_all=0
  while [ $# -gt 0 ]; do
    case "$1" in
      --filter=*)
        {
          IFS=',' read -r -a _parts <<< "${1#*=}"
          for _p in "${_parts[@]}"; do
            [ -n "$_p" ] && filters+=("$_p")
          done
        }
        shift
        ;;
      --filter)
        if [ $# -lt 2 ]; then
          echo "Error: --filter requires a value" >&2
          exit 1
        fi
        {
          IFS=',' read -r -a _parts <<< "$2"
          for _p in "${_parts[@]}"; do
            [ -n "$_p" ] && filters+=("$_p")
          done
        }
        shift 2
        ;;
      --stateful)
        server_mode="stateful"
        grep_tag="@ess"
        shift
        ;;
      --serverless=*)
        case "${1#*=}" in
          es)
            server_mode="serverless=es"; grep_tag="@svlSearch" ;;
          oblt)
            server_mode="serverless=oblt"; grep_tag="@svlOblt" ;;
          security)
            server_mode="serverless=security"; grep_tag="@svlSecurity" ;;
          *)
            echo "Error: --serverless must be one of es|oblt|security" >&2; exit 1 ;;
        esac
        shift
        ;;
      --all)
        run_all=1
        server_mode="all"
        grep_tag="all"
        shift
        ;;
      -h|--help)
        echo "Usage: scripts/scout-vrt.sh test [--filter <string>]... [--stateful | --serverless=<es|oblt|security> | --all]" >&2
        return 0
        ;;
      *)
        echo "Unknown option for 'test': $1" >&2
        echo "Usage: scripts/scout-vrt.sh test [--filter <string>]... [--stateful | --serverless=<es|oblt|security> | --all]" >&2
        exit 1
        ;;
    esac
  done

  echo "Discovering Playwright configs..."
  # Run discovery without validation to include all configs and avoid CI registration failures
  local discovery_output
  if ! discovery_output=$(node scripts/scout discover-playwright-configs 2>&1); then
    echo "$discovery_output" >&2
    echo "Error: failed to discover Playwright configs" >&2
    exit 1
  fi

  # Extract absolute repo-relative config paths from the discovery log output,
  # being resilient to log prefixes (e.g., " info ... - <path>")
  local configs
  configs=$(printf "%s\n" "$discovery_output" |
    sed -En 's/.*((src|x-pack)\/.*test\/scout\/(ui|api)\/(parallel\.)?playwright\.config\.ts).*/\1/p' |
    sort -u)

  if [ ${#filters[@]} -gt 0 ]; then
    local _filtered=""
    while IFS= read -r _cfg; do
      [ -z "$_cfg" ] && continue
      local _match=0
      for _f in "${filters[@]}"; do
        if echo "$_cfg" | grep -F -i -q -- "$_f"; then
          _match=1; break
        fi
      done
      if [ $_match -eq 1 ]; then
        _filtered+="${_cfg}"$'\n'
      fi
    done <<< "$configs"
    configs="$_filtered"
    configs="$(printf "%s\n" "$configs" | sed '/^$/d' | sort -u)"
  fi

  if [ -z "${configs//\n/}" ]; then
    echo "No matching Playwright configs found." >&2
    exit 1
  fi

  local failed=0
  local total=0
  local ran=0
  while IFS= read -r config_path; do
    [ -z "$config_path" ] && continue
    total=$((total + 1))
  done <<< "$configs"

  echo "Running $total config(s) via 'node scripts/scout run-tests'..."
  # Calculate total runs for progress accounting when running all modes
  local total_runs=$total
  if [ $run_all -eq 1 ]; then
    total_runs=$(( total * 4 ))
  fi

  while IFS= read -r config_path; do
    [ -z "$config_path" ] && continue
    if [ $run_all -eq 1 ]; then
      # Run all modes sequentially for this config
      local -a modes=("stateful" "serverless=es" "serverless=oblt" "serverless=security")
      for m in "${modes[@]}"; do
        ran=$((ran + 1))
        local run_cmd=(node scripts/scout run-tests)
        if [ "$m" = "stateful" ]; then
          run_cmd+=(--stateful)
        else
          run_cmd+=("--${m}")
        fi
        run_cmd+=(--config "$config_path")
        echo "[$ran/$total_runs] SCOUT_VISUAL_REGRESSION_ENABLED=true SCOUT_TARGET_MODE=$m ${run_cmd[*]}"
        if ! SCOUT_VISUAL_REGRESSION_ENABLED=true SCOUT_TARGET_MODE="$m" "${run_cmd[@]}"; then
          echo "FAILED: $config_path ($m)" >&2
          failed=1
        else
          echo "PASSED: $config_path ($m)"
        fi
      done
    else
      ran=$((ran + 1))
      # Build run-tests command for a single selected mode
      local run_cmd=(node scripts/scout run-tests)
      if [ "$server_mode" = "stateful" ]; then
        run_cmd+=(--stateful)
      else
        run_cmd+=("--${server_mode}")
      fi
      run_cmd+=(--config "$config_path")
      echo "[$ran/$total_runs] SCOUT_VISUAL_REGRESSION_ENABLED=true SCOUT_TARGET_MODE=$server_mode ${run_cmd[*]}"
      if ! SCOUT_VISUAL_REGRESSION_ENABLED=true SCOUT_TARGET_MODE="$server_mode" "${run_cmd[@]}"; then
        echo "FAILED: $config_path" >&2
        failed=1
      else
        echo "PASSED: $config_path"
      fi
    fi
  done <<< "$configs"

  if [ $failed -ne 0 ]; then
    echo "One or more configs failed." >&2
    exit 1
  fi

  echo "All configs passed."
}

main() {
  if [ $# -eq 0 ]; then
    # No args => apply overlay to current branch/HEAD
    apply_scout_vrt
    exit 0
  fi

  if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
    usage
    exit 0
  fi

  if [ "$1" = "test" ]; then
    shift
    run_tests_command "$@"
    exit 0
  fi

  if [ "$1" = "--reset" ]; then
    reset_to_main
    exit 0
  fi

  local sha="$1"
  if ! git rev-parse --verify --quiet "${sha}^{commit}" >/dev/null; then
    echo "Error: '${sha}' is not a valid commit SHA or ref." >&2
    exit 1
  fi

  apply_scout_vrt "${sha}"
}

main "$@"


