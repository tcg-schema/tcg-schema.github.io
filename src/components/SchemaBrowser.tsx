import { useState, useEffect } from "react";
import { parseTTL, ParsedOntology } from "@/lib/ttl-parser";
import { SchemaNav } from "./SchemaNav";
import { SchemaDetail } from "./SchemaDetail";
import { Search, Loader2 } from "lucide-react";

export function SchemaBrowser() {
  const [ontology, setOntology] = useState<ParsedOntology | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUri, setSelectedUri] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/core.ttl")
      .then(res => {
        if (!res.ok) throw new Error("Failed to load schema");
        return res.text();
      })
      .then(ttl => {
        const parsed = parseTTL(ttl);
        setOntology(parsed);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading schema…</span>
      </div>
    );
  }

  if (error || !ontology) {
    return (
      <div className="text-center py-20 text-destructive">
        Failed to load schema: {error}
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      {/* Search bar */}
      <div className="border-b border-border p-3 flex items-center gap-2">
        <Search className="w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search classes and properties…"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        <div className="text-xs text-muted-foreground">
          {ontology.classes.length} classes · {ontology.properties.length} properties
        </div>
      </div>

      <div className="flex min-h-[500px] max-h-[70vh]">
        {/* Sidebar */}
        <div className="w-72 border-r border-border overflow-y-auto p-3 shrink-0">
          <SchemaNav
            classes={ontology.classes}
            properties={ontology.properties}
            prefixes={ontology.prefixes}
            selectedUri={selectedUri}
            onSelect={setSelectedUri}
            searchQuery={searchQuery}
          />
        </div>

        {/* Detail panel */}
        <div className="flex-1 p-6 overflow-y-auto">
          {selectedUri ? (
            <SchemaDetail uri={selectedUri} ontology={ontology} onNavigate={setSelectedUri} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <p className="text-lg font-medium mb-2">Select a class or property</p>
              <p className="text-sm">Browse the TCG Schema ontology using the navigation panel.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
