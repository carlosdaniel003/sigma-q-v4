export function DiagnosticoAI({ dados }) {
  return (
    <div className="container-diagnostico-visual-padrao">
      <SpikeCard data={dados.spike} />
      <MelhoriaCard data={dados.melhoria} />
      <ReincidenciaCard data={dados.reincidencia} />
      <ReboteCard data={dados.rebote} />
      <TopOfensorCard data={dados.topOfensor} />
    </div>
  )
}