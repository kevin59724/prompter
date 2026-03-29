import { useState } from 'react';
import { Sparkles, Wand2, Copy, Check, Code, Image as ImageIcon, PenLine, RefreshCcw, Scissors, Languages } from 'lucide-react';
import './App.css';

function App() {
  const [inputPrompt, setInputPrompt] = useState('');
  const [outputPrompt, setOutputPrompt] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('image');

  // Categories/Tags for the UI
  const categories = [
    { id: 'image', icon: <ImageIcon size={14} />, label: 'Imágenes' },
    { id: 'code', icon: <Code size={14} />, label: 'Programación' },
    { id: 'write', icon: <PenLine size={14} />, label: 'Redacción' },
  ];

  const handleEnhance = async () => {
    if (!inputPrompt) return;
    setIsEnhancing(true);
    
    try {
      const response = await fetch('/api/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: inputPrompt,
          category: selectedCategory
        }),
      });

      const data = await response.json();

      if (response.ok && data.result) {
        setOutputPrompt(data.result);
      } else {
        throw new Error(data.error || 'Fallo desconocido en el servidor');
      }
    } catch (err: any) {
      console.error(err);
      setOutputPrompt("❌ " + (err.message || "Error comunicándose con el servidor seguro. Revisa los logs de Vercel."));
    } finally {
      setIsEnhancing(false);
    }
  };

  const copyToClipboard = () => {
    if (!outputPrompt) return;
    navigator.clipboard.writeText(outputPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTweak = async (action: string) => {
    if (!outputPrompt || isEnhancing) return;
    setIsEnhancing(true);
    
    try {
      const response = await fetch('/api/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: outputPrompt,
          action: action
        }),
      });

      const data = await response.json();

      if (response.ok && data.result) {
        setOutputPrompt(data.result);
      } else {
        throw new Error(data.error || 'Fallo desconocido del servidor');
      }
    } catch (err: any) {
      console.error(err);
      alert("❌ " + (err.message || "Hubo un error ajustando el prompt. Revisa logs."));
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="global-logo">
        <Sparkles className="logo-icon" />
        <h1>Prompter</h1>
      </div>

      {/* ESPACIO PUBLICITARIO SUPERIOR (ej. AdSense 728x90) */}
      <div className="ad-container ad-banner top-ad" title="Puedes colocar tu código <ins> de AdSense aquí">
        <span>Publicidad Banner Superior<br/>(Recomendado: 728 x 90)</span>
      </div>

      <div className="content-with-sidebars">
        {/* ESPACIO PUBLICITARIO LATERAL IZQUIERDO (ej. AdSense 160x600) */}
        <div className="ad-container ad-sidebar left-ad" title="Puedes colocar tu código <ins> de AdSense aquí">
          <span>Publicidad<br/>Lateral<br/>(160 x 600)</span>
        </div>

        <div className="app-container">
      <main className="main-content">
        {/* Left Panel: Input */}
        <section className="panel fade-in">
          <div className="panel-header">
            <h2 className="panel-title">
              <Wand2 size={24} />
              Tu Prompt Original
            </h2>
          </div>
          
          <div className="tags-container">
            {categories.map(cat => (
              <button 
                key={cat.id} 
                className={`tag ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', border: selectedCategory === cat.id ? undefined : 'none', padding: '0.5rem 1rem' }}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>

          <div className="textarea-wrapper">
            <textarea 
              placeholder="Ej. 'Haz una imagen de un gato' o 'Escribe un artículo sobre IA'..."
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
            />
            <div className="toolbar">
               <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                 {inputPrompt.length} caracteres
               </span>
            </div>
          </div>

          <div className="action-bar">
            <button 
              className="btn-primary" 
              onClick={handleEnhance}
              disabled={!inputPrompt || isEnhancing}
            >
              {isEnhancing ? (
                <>Mejorando...</>
              ) : (
                <>
                  <Sparkles size={18} />
                  Mejorar Prompt
                </>
              )}
            </button>
          </div>
        </section>

        {/* Right Panel: Output */}
        <section className="panel fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="panel-header">
            <h2 className="panel-title">
              <Sparkles size={24} />
              Prompt Mejorado
            </h2>
            <button 
              className="btn-secondary" 
              onClick={copyToClipboard}
              title="Copiar al portapapeles"
              disabled={!outputPrompt}
            >
              {copied ? <Check size={20} color="#10b981" /> : <Copy size={20} />}
            </button>
          </div>

          <div className="textarea-wrapper" style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', borderColor: outputPrompt ? 'var(--color-primary)' : 'var(--color-accent)' }}>
            <textarea 
              readOnly
              placeholder="Aquí aparecerá tu prompt ultra detallado listo para ser usado..."
              value={outputPrompt}
              style={{ color: outputPrompt ? 'var(--color-text)' : 'var(--color-text-muted)' }}
            />
          </div>
          
          {outputPrompt && (
            <div className="tags-container" style={{ marginTop: 'auto' }}>
              <button className="tag" onClick={() => handleTweak('shorten')} style={{ cursor: 'pointer', border: '1px solid var(--color-accent)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Scissors size={14} /> Hacerlo más corto
              </button>
              <button className="tag" onClick={() => handleTweak('translate')} style={{ cursor: 'pointer', border: '1px solid var(--color-accent)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Languages size={14} /> Traducir a Inglés
              </button>
              <button className="tag" onClick={() => handleTweak('vary')} style={{ cursor: 'pointer', border: '1px solid var(--color-accent)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <RefreshCcw size={14} /> Más creativo
              </button>
            </div>
          )}
        </section>
      </main>
        </div>

        {/* ESPACIO PUBLICITARIO LATERAL DERECHO (ej. AdSense 160x600) */}
        <div className="ad-container ad-sidebar right-ad" title="Puedes colocar tu código <ins> de AdSense aquí">
          <span>Publicidad<br/>Lateral<br/>(160 x 600)</span>
        </div>
      </div>

      {/* ESPACIO PUBLICITARIO INFERIOR (ej. AdSense 728x90) */}
      <div className="ad-container ad-banner bottom-ad" title="Puedes colocar tu código <ins> de AdSense aquí">
        <span>Publicidad Banner Inferior<br/>(Recomendado: 728 x 90)</span>
      </div>
    </div>
  );
}

export default App;
