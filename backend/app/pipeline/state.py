from typing import TypedDict, List, Dict, Any, Optional


class PipelineState(TypedDict, total=False):
    firm_name: str
    geography: str
    sector_focus: str
    stage_focus: str
    queries: List[str]
    search_results: List[Dict[str, Any]]
    findings: List[Dict[str, Any]]     # [{fact, source_url, topic}]
    profile: Dict[str, Any]            # structured, per-field confidence + source
    profile_md: str
    summary: str
