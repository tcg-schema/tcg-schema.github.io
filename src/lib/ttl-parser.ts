// Lightweight TTL parser for ontology browsing
// Extracts classes, properties, and their metadata

export interface OntologyMeta {
  uri: string;
  label: string;
  comment: string;
}

export interface OntologyClass {
  uri: string;
  localName: string;
  label: string;
  comment: string;
  subClassOf: string;
  section: string;
}

export interface OntologyProperty {
  uri: string;
  localName: string;
  label: string;
  comment: string;
  domain: string;
  range: string;
  type: "object" | "datatype";
  section: string;
}

export interface ParsedOntology {
  meta: OntologyMeta;
  prefixes: Record<string, string>;
  classes: OntologyClass[];
  properties: OntologyProperty[];
}

function resolvePrefix(prefixes: Record<string, string>, curie: string): string {
  if (curie.startsWith("<") && curie.endsWith(">")) return curie.slice(1, -1);
  const colonIdx = curie.indexOf(":");
  if (colonIdx === -1) return curie;
  const prefix = curie.slice(0, colonIdx);
  const local = curie.slice(colonIdx + 1);
  return (prefixes[prefix] || prefix + ":") + local;
}

function shortName(uri: string): string {
  const hash = uri.lastIndexOf("#");
  if (hash !== -1) return uri.slice(hash + 1);
  const slash = uri.lastIndexOf("/");
  return uri.slice(slash + 1);
}

function stripLang(val: string): string {
  return val.replace(/@[a-z]+$/i, "").replace(/^"|"$/g, "");
}

const XSD_TYPES = new Set([
  "http://www.w3.org/2001/XMLSchema#string",
  "http://www.w3.org/2001/XMLSchema#integer",
  "http://www.w3.org/2001/XMLSchema#boolean",
  "http://www.w3.org/2001/XMLSchema#decimal",
  "http://www.w3.org/2001/XMLSchema#date",
  "http://www.w3.org/2001/XMLSchema#dateTime",
  "http://www.w3.org/2001/XMLSchema#float",
  "http://www.w3.org/2001/XMLSchema#double",
]);

export function parseTTL(ttl: string): ParsedOntology {
  const prefixes: Record<string, string> = {};
  const classes: OntologyClass[] = [];
  const properties: OntologyProperty[] = [];
  const meta: OntologyMeta = { uri: "", label: "", comment: "" };

  // Extract prefixes
  const prefixRegex = /@prefix\s+(\w*):\s+<([^>]+)>\s*\./g;
  let m: RegExpExecArray | null;
  while ((m = prefixRegex.exec(ttl)) !== null) {
    prefixes[m[1]] = m[2];
  }

  // Split into blocks by double newline or section comments
  // Parse block by block using ". \n" as separator
  const blocks = ttl.split(/\.\s*\n/).map(b => b.trim()).filter(b => b && !b.startsWith("@prefix"));

  let currentSection = "Core";
  const sectionRegex = /^#+\s*(.+?)\s*#*$/m;

  for (const block of blocks) {
    // Check for section headers in comments
    const secMatch = sectionRegex.exec(block);
    if (secMatch) {
      const sec = secMatch[1].trim().replace(/^#+\s*/, "").replace(/\s*#+$/, "").trim();
      if (sec && sec.length > 2) currentSection = sec;
    }

    // Find the subject
    const lines = block.split("\n").map(l => l.trim()).filter(l => l && !l.startsWith("#"));
    if (lines.length === 0) continue;

    const firstLine = lines[0];
    // Extract subject
    let subject = "";
    if (firstLine.startsWith("<")) {
      const end = firstLine.indexOf(">");
      subject = firstLine.slice(1, end);
    } else {
      const parts = firstLine.split(/\s+/);
      subject = resolvePrefix(prefixes, parts[0]);
    }

    // Join all predicate-object pairs
    const content = lines.join(" ");

    // Check if it's the ontology itself
    if (content.includes("a owl:Ontology")) {
      meta.uri = subject;
      const labelMatch = content.match(/rdfs:label\s+"([^"]+)"/);
      if (labelMatch) meta.label = stripLang(labelMatch[1]);
      const commentMatch = content.match(/rdfs:comment\s+"([^"]+)"/);
      if (commentMatch) meta.comment = stripLang(commentMatch[1]);
      continue;
    }

    // Check if it's a class
    if (content.match(/\ba\s+(rdfs:Class|owl:Class)\b/)) {
      const cls: OntologyClass = {
        uri: subject,
        localName: shortName(subject),
        label: "",
        comment: "",
        subClassOf: "",
        section: currentSection,
      };
      const labelMatch = content.match(/rdfs:label\s+"([^"]+)"/);
      if (labelMatch) cls.label = stripLang(labelMatch[1]);
      const commentMatch = content.match(/rdfs:comment\s+"([^"]+)"/);
      if (commentMatch) cls.comment = stripLang(commentMatch[1]);
      const subMatch = content.match(/rdfs:subClassOf\s+(\S+)/);
      if (subMatch) cls.subClassOf = resolvePrefix(prefixes, subMatch[1]);
      classes.push(cls);
      continue;
    }

    // Check if it's a property
    if (content.match(/\ba\s+(rdf:Property|owl:ObjectProperty|owl:DatatypeProperty)\b/)) {
      const prop: OntologyProperty = {
        uri: subject,
        localName: shortName(subject),
        label: "",
        comment: "",
        domain: "",
        range: "",
        type: "object",
        section: currentSection,
      };
      const labelMatch = content.match(/rdfs:label\s+"([^"]+)"/);
      if (labelMatch) prop.label = stripLang(labelMatch[1]);
      const commentMatch = content.match(/rdfs:comment\s+"([^"]+)"/);
      if (commentMatch) prop.comment = stripLang(commentMatch[1]);
      const domainMatch = content.match(/rdfs:domain\s+(\S+)/);
      if (domainMatch) prop.domain = resolvePrefix(prefixes, domainMatch[1]);
      const rangeMatch = content.match(/rdfs:range\s+(\S+)/);
      if (rangeMatch) {
        prop.range = resolvePrefix(prefixes, rangeMatch[1]);
        if (XSD_TYPES.has(prop.range) || prop.range.includes("schema.org/Number") || prop.range.includes("schema.org/URL")) {
          prop.type = "datatype";
        }
      }
      properties.push(prop);
      continue;
    }
  }

  return { meta, prefixes, classes, properties };
}

export function shortUri(uri: string, prefixes: Record<string, string>): string {
  for (const [prefix, ns] of Object.entries(prefixes)) {
    if (uri.startsWith(ns)) {
      return `${prefix}:${uri.slice(ns.length)}`;
    }
  }
  // Check common prefixes
  if (uri.startsWith("https://schema.org/")) return `schema:${uri.slice(19)}`;
  if (uri.startsWith("http://www.w3.org/2001/XMLSchema#")) return `xsd:${uri.slice(32)}`;
  if (uri.startsWith("http://www.w3.org/2000/01/rdf-schema#")) return `rdfs:${uri.slice(37)}`;
  if (uri.startsWith("http://www.w3.org/1999/02/22-rdf-syntax-ns#")) return `rdf:${uri.slice(43)}`;
  return shortName(uri);
}
