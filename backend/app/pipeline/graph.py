"""LangGraph 3-node pipeline: research -> structure -> write."""
from typing import Callable, Dict, Any
from langgraph.graph import StateGraph, END
from .state import PipelineState
from .research import run_research
from .structuring import run_structuring
from .writer import run_writer


def build_graph(emit: Callable[[Dict[str, Any]], None]):
    def _r(s): return run_research(s, emit)
    def _s(s): return run_structuring(s, emit)
    def _w(s): return run_writer(s, emit)

    g = StateGraph(dict)
    g.add_node("research", _r)
    g.add_node("structure", _s)
    g.add_node("write", _w)
    g.set_entry_point("research")
    g.add_edge("research", "structure")
    g.add_edge("structure", "write")
    g.add_edge("write", END)
    return g.compile()


def run_pipeline(firm_name: str, geography: str, sector_focus: str,
                 stage_focus: str, emit: Callable) -> PipelineState:
    graph = build_graph(emit)
    initial: PipelineState = {
        "firm_name": firm_name,
        "geography": geography or "",
        "sector_focus": sector_focus or "",
        "stage_focus": stage_focus or "",
    }
    return graph.invoke(initial)
