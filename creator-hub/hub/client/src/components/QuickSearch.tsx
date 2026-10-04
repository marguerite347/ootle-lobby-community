import { useEffect, useRef, useState } from "react";
import {createPortal} from "react-dom";
import { useNavigate } from "react-router-dom";
import { api, type Resource } from "../api";

export default function QuickSearch() {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<Resource[]>([]);
  const [status, setStatus] = useState("");
  const navigate = useNavigate();
  const returnFocus = useRef<HTMLElement | null>(null);
  function open() {
    if (document.querySelector('dialog[open]')) return;
    returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialog.current?.showModal();
    input.current?.focus();
  }
  function go(destination: string) {
    dialog.current?.close();
    navigate(destination);
  }
  useEffect(() => {
    function shortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        open();
      }
    }
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, []);
  useEffect(() => {
    let active = true;
    setItems([]);
    if (!query.trim()) {
      setStatus("");
      return;
    }
    setStatus("Searching…");
    const timer = setTimeout(() => {
      api
        .resources({ q: query.trim() })
        .then((result) => {
          if (!active) return;
          setItems(result.items.slice(0, 6));
          setStatus(
            result.items.length
              ? `${result.items.length} matching resources`
              : "No matches. Try a different search.",
          );
        })
        .catch(() => {
          if (active) setStatus("Search unavailable. Try again.");
        });
    }, 200);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query]);
  return (
    <>
      <button
        ref={trigger}
        className="shell-search"
        onClick={open}
        aria-label="Search the hub"
      >
        ⌕ <span>Search</span>
        <kbd>⌘ K</kbd>
      </button>
      {createPortal(<dialog
        ref={dialog}
        className="quick-search"
        aria-label="Search the Ootle Lobby"
        onClose={() => {
          const previous = returnFocus.current;
          if (previous?.isConnected && previous.getClientRects().length) previous.focus();
          else trigger.current?.focus();
        }}
        onClick={(event) => {
          if (event.target === dialog.current) dialog.current.close();
        }}
      >
        <div className="quick-search-top">
          <h2>Find your next upgrade.</h2>
          <button
            className="btn small"
            onClick={() => dialog.current?.close()}
            aria-label="Close search"
          >
            Esc
          </button>
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            go(`/explore?q=${encodeURIComponent(query)}`);
          }}
        >
          <input
            ref={input}
            aria-label="Search resources"
            placeholder="Games, templates, tools, skills…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button className="btn primary">Search all ↗</button>
        </form>
        <p role="status">{status || "Jump into your next project."}</p>
        <div className="quick-search-results">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => go(`/resource/${encodeURIComponent(item.id)}`)}
            >
              <span>
                <strong>{item.title}</strong>
                <small>
                  {item.type} · {item.ecosystem}
                </small>
              </span>
              <span aria-hidden="true">↗</span>
            </button>
          ))}
        </div>
        {!query && (
          <div className="quick-search-shortcuts">
            {[
              ["/create", "Start creating"],
              ["/projects", "Your projects"],
              ["/challenges", "Community challenges"],
              ["/skills", "Agent skills"],
              ["/create/assets", "Find assets"],
            ].map(([route, label]) => (
              <button key={route} onClick={() => go(route)}>
                {label} ↗
              </button>
            ))}
          </div>
        )}
      </dialog>, document.body)}
    </>
  );
}
