# Pressão das Profundezas

Versão 0.1.0 de teste.

## Requisitos
- Pathfinder 2e
- PF2e Toolbelt
- No Resource Tracker, recursos chamados exatamente `Strain` e `Villain Point`.

## Instalação manual
1. Feche/reinicie o mundo conforme necessário.
2. Extraia a pasta `pressao-das-profundezas` dentro da pasta `Data/modules` do Foundry.
3. Reinicie o Foundry.
4. Ative **Pressão das Profundezas** em Manage Modules.
5. Garanta que cada jogador tenha seu PC definido em User Configuration (Character).

## Macro do GM
Crie um Script Macro contendo:

    game.pressaoDasProfundezas.startRest();

## Teste multiplayer
Entre também com uma conta de jogador. O GM inicia o descanso; o jogador clica no teste no chat.
O módulo encaminha a escolha ao GM e manda a sequência de rolagens para o cliente do jogador.

## Observação
Esta é uma primeira versão de teste. As penalidades de próximo teste (Initiative/Perception/Crafting/Stealth)
podem gerar Effects. As demais consequências continuam como escolhas manuais do GM.
