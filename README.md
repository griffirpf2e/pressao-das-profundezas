# Pressão das Profundezas

Módulo multiplayer de Strain para Pathfinder 2e / Foundry VTT.

## v0.2.0
- Failure e Critical Failure aumentam `Strain` em +1, limitado pelo Resource Tracker.
- Failure/CF continuam aumentando `Villain Point` em +1.
- Modificadores dos testes: `+1 → -1 → -3 → -5 → -6` (cap).
- Botão escolhido usa indicador estático `✓ ... — Escolhido`.
- Cada um dos 20 eventos possui texto narrativo próprio de falha.
- Critical Failure acrescenta uma linha narrativa extra.
- Battle Medicine em Strain 4: imunidade por 1 hora.
- Effects de penalidade de próximo teste continuam removendo-se após a rolagem.

## Requisitos
- Pathfinder 2e
- PF2e Toolbelt
- Resource Tracker com recursos chamados exatamente `Strain` e `Villain Point`

## Macro do GM
```js
game.pressaoDasProfundezas.startRest();
```

## Manifest
`https://github.com/undergroundjv-spec/pressao-das-profundezas/releases/latest/download/module.json`
