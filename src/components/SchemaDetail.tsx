import { OntologyClass, OntologyProperty, ParsedOntology, shortUri } from "@/lib/ttl-parser";

interface SchemaDetailProps {
  uri: string;
  ontology: ParsedOntology;
  onNavigate: (uri: string) => void;
}

function UriLink({ uri, prefixes, onNavigate, ontology }: { uri: string; prefixes: Record<string, string>; onNavigate: (uri: string) => void; ontology: ParsedOntology }) {
  const isInternal = ontology.classes.some(c => c.uri === uri) || ontology.properties.some(p => p.uri === uri);
  const short = shortUri(uri, prefixes);

  if (isInternal) {
    return (
      <button onClick={() => onNavigate(uri)} className="font-mono text-sm text-primary hover:underline">
        {short}
      </button>
    );
  }

  return (
    <a href={uri} target="_blank" rel="noopener noreferrer" className="font-mono text-sm text-schema-external hover:underline">
      {short} ↗
    </a>
  );
}

export function SchemaDetail({ uri, ontology, onNavigate }: SchemaDetailProps) {
  const cls = ontology.classes.find(c => c.uri === uri);
  const prop = ontology.properties.find(p => p.uri === uri);

  if (cls) return <ClassDetail cls={cls} ontology={ontology} onNavigate={onNavigate} />;
  if (prop) return <PropertyDetail prop={prop} ontology={ontology} onNavigate={onNavigate} />;

  return <div className="text-muted-foreground p-6">Select a class or property to view details.</div>;
}

function ClassDetail({ cls, ontology, onNavigate }: { cls: OntologyClass; ontology: ParsedOntology; onNavigate: (uri: string) => void }) {
  const subclasses = ontology.classes.filter(c => c.subClassOf === cls.uri);
  const domainProps = ontology.properties.filter(p => p.domain === cls.uri);
  const rangeProps = ontology.properties.filter(p => p.range === cls.uri);

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-3 h-3 rounded-full bg-schema-class" />
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Class</span>
        </div>
        <h2 className="text-2xl font-bold font-mono">{cls.localName}</h2>
        <p className="text-xs font-mono text-muted-foreground mt-1 break-all">{cls.uri}</p>
      </div>

      {cls.comment && (
        <p className="text-sm text-muted-foreground leading-relaxed">{cls.comment}</p>
      )}

      {cls.subClassOf && (
        <div>
          <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">Extends</h4>
          <UriLink uri={cls.subClassOf} prefixes={ontology.prefixes} onNavigate={onNavigate} ontology={ontology} />
        </div>
      )}

      {subclasses.length > 0 && (
        <div>
          <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">Subclasses</h4>
          <div className="flex flex-wrap gap-2">
            {subclasses.map(s => (
              <button key={s.uri} onClick={() => onNavigate(s.uri)} className="text-xs font-mono px-2 py-1 rounded-md bg-schema-class/10 text-schema-class hover:bg-schema-class/20 transition-colors">
                {s.localName}
              </button>
            ))}
          </div>
        </div>
      )}

      {domainProps.length > 0 && (
        <div>
          <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">Properties with this domain</h4>
          <div className="space-y-1">
            {domainProps.map(p => (
              <div key={p.uri} className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${p.type === "datatype" ? "bg-schema-datatype" : "bg-schema-property"}`} />
                <button onClick={() => onNavigate(p.uri)} className="font-mono text-xs text-primary hover:underline">{p.localName}</button>
                <span className="text-muted-foreground text-xs">→</span>
                <UriLink uri={p.range} prefixes={ontology.prefixes} onNavigate={onNavigate} ontology={ontology} />
              </div>
            ))}
          </div>
        </div>
      )}

      {rangeProps.length > 0 && (
        <div>
          <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">Properties pointing to this</h4>
          <div className="space-y-1">
            {rangeProps.map(p => (
              <div key={p.uri} className="flex items-center gap-2">
                <UriLink uri={p.domain} prefixes={ontology.prefixes} onNavigate={onNavigate} ontology={ontology} />
                <span className="text-muted-foreground text-xs">→</span>
                <button onClick={() => onNavigate(p.uri)} className="font-mono text-xs text-primary hover:underline">{p.localName}</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PropertyDetail({ prop, ontology, onNavigate }: { prop: OntologyProperty; ontology: ParsedOntology; onNavigate: (uri: string) => void }) {
  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className={`w-3 h-3 rounded-full ${prop.type === "datatype" ? "bg-schema-datatype" : "bg-schema-property"}`} />
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            {prop.type === "datatype" ? "Datatype Property" : "Object Property"}
          </span>
        </div>
        <h2 className="text-2xl font-bold font-mono">{prop.localName}</h2>
        <p className="text-xs font-mono text-muted-foreground mt-1 break-all">{prop.uri}</p>
      </div>

      {prop.comment && (
        <p className="text-sm text-muted-foreground leading-relaxed">{prop.comment}</p>
      )}

      <div className="grid grid-cols-2 gap-4">
        {prop.domain && (
          <div>
            <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">Domain</h4>
            <UriLink uri={prop.domain} prefixes={ontology.prefixes} onNavigate={onNavigate} ontology={ontology} />
          </div>
        )}
        {prop.range && (
          <div>
            <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">Range</h4>
            <UriLink uri={prop.range} prefixes={ontology.prefixes} onNavigate={onNavigate} ontology={ontology} />
          </div>
        )}
      </div>
    </div>
  );
}
