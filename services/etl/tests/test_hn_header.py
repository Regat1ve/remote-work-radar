"""Regression tests for the HN 'Who is hiring?' first-line parser.

HN posters put pipes between (company, role, location, stack) but the order
drifts — sometimes company | role | location, sometimes company | location |
role. The parser has to pick the token that reads like a role instead of
always trusting token 1.
"""

from __future__ import annotations

import pytest

from remote_work_radar_etl.sources.hn_hiring import _parse_first_line


class TestHnHeader:
    @pytest.mark.parametrize(
        "line,expected_company,expected_title",
        [
            # Standard: company | role | location
            ("Lantern | Software Engineer | Remote", "Lantern", "Software Engineer"),
            # Drifted: company | location | role
            ("Acme | San Francisco, CA | Backend Engineer", "Acme", "Backend Engineer"),
            # REMOTE token before role
            ("MixRank | REMOTE | Full-Stack Developer", "MixRank", "Full-Stack Developer"),
            # Stack in the mix — pick the role, not the stack
            ("DrSwarm | REMOTE | Founding Engineer | TypeScript", "DrSwarm", "Founding Engineer"),
            # Only two tokens
            ("Fusionbox | Python + TypeScript Engineers", "Fusionbox", "Python + TypeScript Engineers"),
            # Sales / non-eng role — still recognized
            ("Company | New York | Sales Manager", "Company", "Sales Manager"),
        ],
    )
    def test_picks_role_regardless_of_order(
        self, line: str, expected_company: str, expected_title: str
    ) -> None:
        company, title = _parse_first_line(line)
        assert company == expected_company
        assert title == expected_title

    def test_no_pipe_returns_unknown_company(self) -> None:
        company, title = _parse_first_line("We are hiring backend devs, apply here.")
        assert company == "Unknown"
        assert "hiring" in title.lower()

    def test_empty_input(self) -> None:
        assert _parse_first_line("") == ("Unknown", "Untitled HN post")

    def test_html_entities_decoded(self) -> None:
        # HN sometimes escapes apostrophes as &#x27;
        line = "Acme | Let&#x27;s build stuff | Senior Engineer"
        company, title = _parse_first_line(line)
        assert company == "Acme"
        assert title == "Senior Engineer"

    def test_no_role_keyword_falls_back_to_token_one(self) -> None:
        # If nothing reads like a role, keep the old behavior (token 1)
        company, title = _parse_first_line("Acme | Rapid growth | Remote OK")
        assert company == "Acme"
        assert title == "Rapid growth"
