// Estilos no bloco "404" de src/styles/global.css (sem folha de estilo extra).
// data-enter: entrada em CSS puro no primeiro paint (a página não tem Navbar/JS de movimento).
export const metadata = { title: 'Página não encontrada | GTAP' };

export default function NotFound() {
  return (
    <main className="not-found">
      <h1 className="not-found-title" data-enter>Página não encontrada</h1>
      <span className="not-found-bar" aria-hidden="true" data-enter="line" />
      <p className="not-found-text" data-enter>O endereço solicitado não existe.</p>
      <nav className="not-found-actions" aria-label="Caminhos sugeridos" data-enter>
        <a className="not-found-link" href="/">Voltar ao GTAP</a>
        <a className="not-found-link" href="/galeria/">Ver a galeria</a>
        <a className="not-found-link" href="/#contato">Falar com a equipe</a>
      </nav>
    </main>
  );
}
