#!/usr/bin/env python

import os
import re
import sys
from datetime import datetime

try:
    import yaml
    from scholarly import scholarly
except ImportError:
    print("Missing dependency: scholarly and/or PyYAML. Install them in your chosen Python environment before running this script.")
    sys.exit(1)


CONFIG_FILE = "_config.yml"
OUTPUT_FILE = "_data/citations.yml"


def load_scholar_user_id() -> str:
    if not os.path.exists(CONFIG_FILE):
        print(f"Configuration file {CONFIG_FILE} not found.")
        sys.exit(1)

    with open(CONFIG_FILE, "r") as f:
        config = yaml.safe_load(f)

    scholar_user_id = config.get("scholar_userid")
    if not scholar_user_id:
        print("No 'scholar_userid' found in _config.yml.")
        sys.exit(1)

    return scholar_user_id


def load_bibtex_keys() -> set[str]:
    bibliography = "_bibliography/papers.bib"
    if not os.path.exists(bibliography):
        return set()

    with open(bibliography, "r") as f:
        content = f.read()

    return set(re.findall(r"google_scholar_id\s*=\s*[{\"]([^}\"]+)[}\"]", content))


def get_scholar_citations() -> None:
    scholar_user_id = load_scholar_user_id()
    today = datetime.now().strftime("%Y-%m-%d")
    existing_data = {}

    if os.path.exists(OUTPUT_FILE):
      with open(OUTPUT_FILE, "r") as f:
          existing_data = yaml.safe_load(f) or {}

      if existing_data.get("metadata", {}).get("last_updated") == today:
          print("Citations data is already up to date. Skipping fetch.")
          return

    print(f"Fetching citations for Google Scholar ID: {scholar_user_id}")
    scholarly.set_timeout(15)
    scholarly.set_retries(3)

    try:
        author = scholarly.search_author_id(scholar_user_id)
        author_data = scholarly.fill(author)
    except Exception as e:
        print(f"Error fetching Google Scholar data: {e}")
        sys.exit(1)

    wanted_ids = load_bibtex_keys()
    citation_data = {"metadata": {"last_updated": today}, "papers": {}}

    for pub in author_data.get("publications", []):
        pub_id = pub.get("pub_id") or pub.get("author_pub_id")
        if not pub_id:
            continue

        article_id = pub_id.split(":")[-1]
        if wanted_ids and article_id not in wanted_ids and pub_id not in wanted_ids:
            continue

        bib = pub.get("bib", {})
        citation_data["papers"][pub_id] = {
            "title": bib.get("title", "Unknown Title"),
            "year": bib.get("pub_year", "Unknown Year"),
            "citations": pub.get("num_citations", 0),
        }

    if existing_data.get("papers") == citation_data["papers"]:
        print("No citation changes found. Skipping file update.")
        return

    with open(OUTPUT_FILE, "w") as f:
        yaml.dump(citation_data, f, width=1000, sort_keys=True)

    print(f"Citation data saved to {OUTPUT_FILE}")


if __name__ == "__main__":
    get_scholar_citations()
