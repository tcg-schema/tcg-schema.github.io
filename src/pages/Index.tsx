import { SchemaBrowser } from "@/components/SchemaBrowser";
import { Download, Github, ExternalLink } from "lucide-react";
import logo from "@/assets/out.png";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="TCG Schema" className="h-10" />
            <span className="font-bold text-lg tracking-tight">tcg-schema.org</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/core.ttl"
              download="core.ttl"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download TTL
            </a>
            <a
              href="https://github.com/tcg-schema"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container max-w-6xl mx-auto px-4 py-12">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-extrabold tracking-tight mb-3">
            TCG Schema — Core Vocabulary
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            An open, schema.org-aligned ontology for Trading Card Games. Describes cards, printings, sets, decks, formats, legality, mechanics, resources, metagame archetypes, and LLM-friendly descriptors.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground">
              <span className="w-2 h-2 rounded-full bg-schema-class" /> Classes
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground">
              <span className="w-2 h-2 rounded-full bg-schema-property" /> Object Properties
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground">
              <span className="w-2 h-2 rounded-full bg-schema-datatype" /> Datatype Properties
            </span>
            <a
              href="https://schema.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
            >
              <ExternalLink className="w-3 h-3" /> schema.org aligned
            </a>
          </div>
        </div>
      </section>

      {/* Schema Browser */}
      <section className="container max-w-6xl mx-auto px-4 pb-12">
        <SchemaBrowser />
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} tcg-schema.org — MIT License</span>
          <div className="flex items-center gap-4">
            <a href="https://github.com/tcg-schema" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
              GitHub
            </a>
            <a href="/core.ttl" download="core.ttl" className="hover:text-foreground transition-colors">
              Download TTL
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
