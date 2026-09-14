"""Provider-agnostic LLM client. Adapted from MARA's llm_client.py, trimmed
to Anthropic + OpenAI (the two providers the Lanmea demo needs)."""
from typing import Iterator, List, Dict
from .config import (
    LLM_PROVIDER, ANTHROPIC_API_KEY, ANTHROPIC_MODEL,
    OPENAI_API_KEY, OPENAI_MODEL,
)


def ask_llm(system: str, messages: List[Dict], *, max_tokens: int = 1500,
            temperature: float = 0.3) -> str:
    """Non-streaming completion. Returns the model's text."""
    if LLM_PROVIDER == "openai":
        from openai import OpenAI
        client = OpenAI(api_key=OPENAI_API_KEY)
        full = ([{"role": "system", "content": system}] if system else []) + messages
        resp = client.chat.completions.create(
            model=OPENAI_MODEL, messages=full,
            max_tokens=max_tokens, temperature=temperature,
        )
        return (resp.choices[0].message.content or "").strip()

    from anthropic import Anthropic
    client = Anthropic(api_key=ANTHROPIC_API_KEY)
    resp = client.messages.create(
        model=ANTHROPIC_MODEL, system=system or "", messages=messages,
        max_tokens=max_tokens, temperature=temperature,
    )
    return (resp.content[0].text or "").strip()


def stream_llm(system: str, messages: List[Dict], *, max_tokens: int = 2500,
               temperature: float = 0.3) -> Iterator[str]:
    """Streaming completion. Yields text chunks."""
    if LLM_PROVIDER == "openai":
        from openai import OpenAI
        client = OpenAI(api_key=OPENAI_API_KEY)
        full = ([{"role": "system", "content": system}] if system else []) + messages
        stream = client.chat.completions.create(
            model=OPENAI_MODEL, messages=full, max_tokens=max_tokens,
            temperature=temperature, stream=True,
        )
        for chunk in stream:
            delta = chunk.choices[0].delta.content if chunk.choices else None
            if delta:
                yield delta
        return

    from anthropic import Anthropic
    client = Anthropic(api_key=ANTHROPIC_API_KEY)
    with client.messages.stream(
        model=ANTHROPIC_MODEL, system=system or "", messages=messages,
        max_tokens=max_tokens, temperature=temperature,
    ) as s:
        for text in s.text_stream:
            if text:
                yield text
