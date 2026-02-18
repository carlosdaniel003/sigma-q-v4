// app/development/catalogo/components/CatalogoSearch.tsx
export function CatalogoSearch({ value, onChange, placeholder }: any) {
  return (
    <input
      type="text"
      placeholder={placeholder || "Pesquisar..."}
      className="input-busca-global"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%",
        maxWidth: "calc(100% - 4px)",
        display: "block",
        padding: "14px 20px", // Aumentado para combinar com o visual premium
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.1)",
        background: "rgba(15, 23, 42, 0.4)", // Mesmo fundo glass da tabela
        color: "white",
        marginBottom: 24,
        outline: 'none',
        transition: 'border-color 0.3s ease',
        backdropFilter: 'blur(10px)'
      }}
    />
  );
}