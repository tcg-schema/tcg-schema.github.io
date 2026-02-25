import { OntologyClass, OntologyProperty, shortUri } from "@/lib/ttl-parser";
import { useMemo } from "react";

interface SchemaNavProps {
  classes: OntologyClass[];
  properties: OntologyProperty[];
  prefixes: Record<string, string>;
  selectedUri: string | null;
  onSelect: (uri: string) => void;
  searchQuery: string;
}

export function SchemaNav({ classes, properties, prefixes, selectedUri, onSelect, searchQuery }: SchemaNavProps) {
  const filteredClasses = useMemo(() => {
    if (!searchQuery) return classes;
    const q = searchQuery.toLowerCase();
    return classes.filter(c => c.localName.toLowerCase().includes(q) || c.label.toLowerCase().includes(q) || c.comment.toLowerCase().includes(q));
  }, [classes, searchQuery]);

  const filteredProperties = useMemo(() => {
    if (!searchQuery) return properties;
    const q = searchQuery.toLowerCase();
    return properties.filter(p => p.localName.toLowerCase().includes(q) || p.label.toLowerCase().includes(q) || p.comment.toLowerCase().includes(q));
  }, [properties, searchQuery]);

  const classSections = useMemo(() => {
    const sections: Record<string, OntologyClass[]> = {};
    filteredClasses.forEach(c => {
      const s = c.section || "Core";
      (sections[s] ??= []).push(c);
    });
    return sections;
  }, [filteredClasses]);

  const propSections = useMemo(() => {
    const sections: Record<string, OntologyProperty[]> = {};
    filteredProperties.forEach(p => {
      const s = p.section || "Properties";
      (sections[s] ??= []).push(p);
    });
    return sections;
  }, [filteredProperties]);

  return (
    <nav className="space-y-4 text-sm">
      <div>
        <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2">
          Classes ({filteredClasses.length})
        </h3>
        {Object.entries(classSections).map(([section, items]) => (
          <div key={section} className="mb-3">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground/70 mb-1 px-2">{section}</div>
            {items.map(c => (
              <button
                key={c.uri}
                onClick={() => onSelect(c.uri)}
                className={`w-full text-left px-2 py-1.5 rounded-md transition-colors flex items-center gap-2 ${
                  selectedUri === c.uri
                    ? "bg-primary/10 text-primary font-medium"
                    : "hover:bg-accent text-foreground"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-schema-class shrink-0" />
                <span className="font-mono text-xs">{shortUri(c.uri, prefixes)}</span>
              </button>
            ))}
          </div>
        ))}
      </div>

      <div>
        <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2">
          Properties ({filteredProperties.length})
        </h3>
        {Object.entries(propSections).map(([section, items]) => (
          <div key={section} className="mb-3">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground/70 mb-1 px-2">{section}</div>
            {items.map(p => (
              <button
                key={p.uri}
                onClick={() => onSelect(p.uri)}
                className={`w-full text-left px-2 py-1.5 rounded-md transition-colors flex items-center gap-2 ${
                  selectedUri === p.uri
                    ? "bg-primary/10 text-primary font-medium"
                    : "hover:bg-accent text-foreground"
                }`}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${p.type === "datatype" ? "bg-schema-datatype" : "bg-schema-property"}`} />
                <span className="font-mono text-xs">{shortUri(p.uri, prefixes)}</span>
              </button>
            ))}
          </div>
        ))}
      </div>
    </nav>
  );
}
