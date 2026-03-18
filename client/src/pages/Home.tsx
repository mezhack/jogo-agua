import { useState, useEffect } from 'react';

/**
 * Data Center Manager Game - Cyberpunk Retrô Theme
 * 
 * Lógica do jogo:
 * - Manter data center funcionando por 30 dias
 * - Gerenciar 3 recursos: água (reservatório), aquecimento, satisfação da cidade
 * - Ações: Resfriar (usa água), Ignorar (aquecimento acumula), Fornecer (satisfação aumenta)
 * - Derrota: Reservatório vazio ou aquecimento > 60
 */

interface GameState {
  dia: number;
  reservatorio: number;
  aquecimentoAcu: number;
  demanda: number;
  satisfacao: number;
  gameStatus: 'menu' | 'playing' | 'gameover_agua' | 'gameover_aquecimento' | 'vitoria';
  logs: string[];
  chuva: boolean;
}

export default function Home() {
  const [game, setGame] = useState<GameState>({
    dia: 1,
    reservatorio: 200,
    aquecimentoAcu: 0,
    demanda: 0,
    satisfacao: 200,
    gameStatus: 'menu',
    logs: [],
    chuva: false,
  });

  const [inputValue, setInputValue] = useState('');
  const [gameStarted, setGameStarted] = useState(false);

  const addLog = (message: string) => {
    setGame(prev => ({
      ...prev,
      logs: [...prev.logs.slice(-9), message]
    }));
  };

  const startGame = () => {
    setGameStarted(true);
    setGame(prev => ({
      ...prev,
      gameStatus: 'playing',
      logs: [
        '> SISTEMA INICIALIZADO',
        '> VOCÊ FOI CONTRATADO PARA CUIDAR DO DATA CENTER',
        '> MISSÃO: MANTER O SISTEMA FUNCIONANDO POR 30 DIAS',
        '> GERENCIAR ÁGUA, RESFRIAMENTO E SATISFAÇÃO DA CIDADE',
        '> PRESSIONE "COMEÇAR" PARA INICIAR'
      ]
    }));
    proximoTurno();
  };

  const proximoTurno = () => {
    setGame(prev => {
      let novoReservatorio = prev.reservatorio;
      let novaSatisfacao = prev.satisfacao;
      let novoChuva = false;

      // Verificar chuva (20% de chance)
      if (Math.random() <= 0.2) {
        novoReservatorio += 20;
        novoChuva = true;
        addLog('> [ALERTA] CHUVA DETECTADA! +20 DE ÁGUA');
      }

      // Reduzir satisfação se não fornecer água
      novaSatisfacao -= 10;

      // Gerar nova demanda
      const novaDemanda = Math.floor(Math.random() * 30) + 1;

      return {
        ...prev,
        dia: prev.dia + 1,
        reservatorio: novoReservatorio,
        satisfacao: novaSatisfacao,
        demanda: novaDemanda,
        chuva: novoChuva,
        logs: [
          ...prev.logs.slice(-8),
          `> DIA ${prev.dia + 1} - DEMANDA: ${novaDemanda} | AQUECIMENTO DETECTADO!`
        ]
      };
    });
  };

  const handleResfriar = () => {
    const quantidade = parseInt(inputValue);
    
    if (!quantidade || quantidade < 1 || quantidade > 43) {
      addLog('> [ERRO] VALOR INVÁLIDO! ESCOLHA ENTRE 1 E 43');
      return;
    }

    setGame(prev => {
      let novoReservatorio = prev.reservatorio - quantidade;
      let novoAquecimento = Math.max(0, prev.aquecimentoAcu + prev.demanda - quantidade);

      if (novoReservatorio <= 0) {
        addLog('> [CRÍTICO] RESERVATÓRIO VAZIO! GAME OVER');
        return {
          ...prev,
          gameStatus: 'gameover_agua',
          logs: [...prev.logs.slice(-8), '> VOCÊ PERDEU! RESERVATÓRIO ESGOTADO']
        };
      }

      addLog(`> RESFRIAMENTO EXECUTADO: -${quantidade} DE ÁGUA`);
      addLog(`> AQUECIMENTO ACUMULADO: ${novoAquecimento}`);

      if (novoAquecimento >= 60) {
        addLog('> [CRÍTICO] AQUECIMENTO CRÍTICO! SERVIDOR ESTOUROU!');
        return {
          ...prev,
          gameStatus: 'gameover_aquecimento',
          logs: [...prev.logs.slice(-8), '> VOCÊ PERDEU! AQUECIMENTO CRÍTICO']
        };
      }

      setInputValue('');
      
      if (prev.dia >= 30) {
        return {
          ...prev,
          reservatorio: novoReservatorio,
          aquecimentoAcu: novoAquecimento,
          gameStatus: 'vitoria',
          logs: [...prev.logs.slice(-8), '> PARABÉNS! VOCÊ COMPLETOU 30 DIAS!']
        };
      }

      setTimeout(() => proximoTurno(), 500);

      return {
        ...prev,
        reservatorio: novoReservatorio,
        aquecimentoAcu: novoAquecimento,
      };
    });
  };

  const handleIgnorar = () => {
    setGame(prev => {
      const novoAquecimento = prev.aquecimentoAcu + prev.demanda;

      addLog(`> AQUECIMENTO IGNORADO! ACUMULADO: ${novoAquecimento}`);

      if (novoAquecimento >= 60) {
        addLog('> [CRÍTICO] AQUECIMENTO CRÍTICO! SERVIDOR ESTOUROU!');
        return {
          ...prev,
          gameStatus: 'gameover_aquecimento',
          logs: [...prev.logs.slice(-8), '> VOCÊ PERDEU! AQUECIMENTO CRÍTICO']
        };
      }

      if (prev.dia >= 30) {
        return {
          ...prev,
          aquecimentoAcu: novoAquecimento,
          gameStatus: 'vitoria',
          logs: [...prev.logs.slice(-8), '> PARABÉNS! VOCÊ COMPLETOU 30 DIAS!']
        };
      }

      setTimeout(() => proximoTurno(), 500);

      return {
        ...prev,
        aquecimentoAcu: novoAquecimento,
      };
    });
  };

  const handleFornecer = () => {
    const quantidade = parseInt(inputValue);

    if (!quantidade || quantidade < 1 || quantidade > 50) {
      addLog('> [ERRO] VALOR INVÁLIDO! ESCOLHA ENTRE 1 E 50');
      return;
    }

    setGame(prev => {
      let novoReservatorio = prev.reservatorio - quantidade;
      let novaSatisfacao = prev.satisfacao + 20;

      if (novoReservatorio <= 0) {
        addLog('> [CRÍTICO] RESERVATÓRIO VAZIO! GAME OVER');
        return {
          ...prev,
          gameStatus: 'gameover_agua',
          logs: [...prev.logs.slice(-8), '> VOCÊ PERDEU! RESERVATÓRIO ESGOTADO']
        };
      }

      addLog(`> ÁGUA FORNECIDA À CIDADE: +${quantidade}`);
      addLog(`> SATISFAÇÃO: ${novaSatisfacao}`);

      setInputValue('');

      if (prev.dia >= 30) {
        return {
          ...prev,
          reservatorio: novoReservatorio,
          satisfacao: novaSatisfacao,
          gameStatus: 'vitoria',
          logs: [...prev.logs.slice(-8), '> PARABÉNS! VOCÊ COMPLETOU 30 DIAS!']
        };
      }

      setTimeout(() => proximoTurno(), 500);

      return {
        ...prev,
        reservatorio: novoReservatorio,
        satisfacao: novaSatisfacao,
      };
    });
  };

  const resetGame = () => {
    setGame({
      dia: 1,
      reservatorio: 200,
      aquecimentoAcu: 0,
      demanda: 0,
      satisfacao: 200,
      gameStatus: 'menu',
      logs: [],
      chuva: false,
    });
    setGameStarted(false);
    setInputValue('');
  };

  const getReservatoriColor = () => {
    if (game.reservatorio > 150) return '#39FF14';
    if (game.reservatorio > 75) return '#B026FF';
    return '#FF006E';
  };

  const getAquecimentoColor = () => {
    if (game.aquecimentoAcu < 20) return '#39FF14';
    if (game.aquecimentoAcu < 40) return '#B026FF';
    return '#FF006E';
  };

  const getSatisfacaoColor = () => {
    if (game.satisfacao > 150) return '#39FF14';
    if (game.satisfacao > 75) return '#B026FF';
    return '#FF006E';
  };

  return (
    <div 
      className="min-h-screen w-full text-[#00D9FF] font-mono overflow-hidden relative"
      style={{
        backgroundImage: 'url(/chuva.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Overlay escuro para melhorar legibilidade */}
      <div className="absolute inset-0 bg-black/60 pointer-events-none" />
      <div className="relative z-10">
      {/* Menu Inicial */}
      {!gameStarted ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="panel-cyberpunk max-w-2xl w-full mx-4">
            <h1 className="text-4xl font-bold mb-6 text-center neon-text">
              DATA CENTER MANAGER
            </h1>
            <h2 className="text-2xl font-bold mb-8 text-center text-[#FF006E]">
              SOCORRO, SP
            </h2>
            
            <div className="space-y-4 mb-8 text-sm leading-relaxed">
              <p>
                &gt; Você foi contratado para gerenciar um data center crítico.
              </p>
              <p>
                &gt; Sua missão: manter o sistema funcionando por 30 dias.
              </p>
              <p>
                &gt; Você deve equilibrar três recursos:
              </p>
              <ul className="ml-4 space-y-2">
                <li>&gt; ÁGUA: Use para resfriar servidores</li>
                <li>&gt; AQUECIMENTO: Não deixe exceder 60</li>
                <li>&gt; SATISFAÇÃO: Forneça água à cidade</li>
              </ul>
              <p className="text-[#39FF14]">
                &gt; Ações disponíveis: RESFRIAR | IGNORAR | FORNECER
              </p>
            </div>

            <button
              onClick={startGame}
              className="neon-button w-full text-lg"
            >
              COMEÇAR JOGO
            </button>
          </div>
        </div>
      ) : game.gameStatus === 'menu' ? null : (
        <div className="min-h-screen flex flex-col p-4 md:p-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold neon-text text-center mb-4">
              DATA CENTER MANAGER
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* ÁGUA */}
              <div className="panel-cyberpunk">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-xs text-[#B026FF] font-bold">ÁGUA</div>
                  <div className="text-sm font-bold" style={{ color: getReservatoriColor() }}>
                    {game.reservatorio}/200
                  </div>
                </div>
                <div className="progress-bar-cyberpunk">
                  <div
                    className="progress-bar-fill transition-all duration-300"
                    style={{
                      width: `${Math.min((game.reservatorio / 200) * 100, 100)}%`,
                      backgroundColor: getReservatoriColor(),
                    }}
                  />
                </div>
              </div>

              {/* AQUECIMENTO */}
              <div className="panel-cyberpunk">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-xs text-[#B026FF] font-bold">AQUECIMENTO</div>
                  <div className="text-sm font-bold" style={{ color: getAquecimentoColor() }}>
                    {game.aquecimentoAcu}/60
                  </div>
                </div>
                <div className="progress-bar-cyberpunk">
                  <div
                    className="progress-bar-fill transition-all duration-300"
                    style={{
                      width: `${Math.min((game.aquecimentoAcu / 60) * 100, 100)}%`,
                      backgroundColor: getAquecimentoColor(),
                    }}
                  />
                </div>
              </div>

              {/* SATISFAÇÃO */}
              <div className="panel-cyberpunk">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-xs text-[#B026FF] font-bold">SATISFAÇÃO</div>
                  <div className="text-sm font-bold" style={{ color: getSatisfacaoColor() }}>
                    {game.satisfacao}/200
                  </div>
                </div>
                <div className="progress-bar-cyberpunk">
                  <div
                    className="progress-bar-fill transition-all duration-300"
                    style={{
                      width: `${Math.min((game.satisfacao / 200) * 100, 100)}%`,
                      backgroundColor: getSatisfacaoColor(),
                    }}
                  />
                </div>
              </div>
            </div>

            {/* DIA */}
            <div className="panel-cyberpunk text-center">
              <div className="text-xs text-[#B026FF] mb-2">DIA ATUAL</div>
              <div className="text-3xl font-bold neon-text">{game.dia}/30</div>
            </div>
          </div>

          {/* Game Status */}
          {game.gameStatus === 'vitoria' && (
            <div className="panel-cyberpunk border-[#39FF14] neon-border-green mb-6 text-center">
              <h2 className="text-2xl font-bold text-[#39FF14] mb-4">
                VITÓRIA! MISSÃO CUMPRIDA!
              </h2>
              <p className="mb-4">Você completou 30 dias com sucesso!</p>
              <button
                onClick={resetGame}
                className="neon-button-green w-full"
              >
                JOGAR NOVAMENTE
              </button>
            </div>
          )}

          {game.gameStatus === 'gameover_agua' && (
            <div className="panel-cyberpunk-red mb-6 text-center">
              <h2 className="text-2xl font-bold text-[#FF006E] mb-4">
                GAME OVER - RESERVATÓRIO VAZIO
              </h2>
              <p className="mb-4">Você deixou o reservatório secar!</p>
              <button
                onClick={resetGame}
                className="neon-button-red w-full"
              >
                TENTAR NOVAMENTE
              </button>
            </div>
          )}

          {game.gameStatus === 'gameover_aquecimento' && (
            <div className="panel-cyberpunk-red mb-6 text-center">
              <h2 className="text-2xl font-bold text-[#FF006E] mb-4">
                GAME OVER - AQUECIMENTO CRÍTICO
              </h2>
              <p className="mb-4">O servidor superaqueceu e queimou!</p>
              <button
                onClick={resetGame}
                className="neon-button-red w-full"
              >
                TENTAR NOVAMENTE
              </button>
            </div>
          )}

          {/* Log Console */}
          <div className="flex-1 panel-cyberpunk mb-6 overflow-y-auto max-h-64">
            <div className="space-y-1 text-xs md:text-sm font-mono">
              {game.logs.map((log, idx) => (
                <div key={idx} className="text-[#00D9FF]">
                  {log}
                </div>
              ))}
            </div>
          </div>

          {/* Input and Actions */}
          {(game.gameStatus === 'playing') && (
            <div className="space-y-4">
              <div className="panel-cyberpunk">
                <label className="block text-xs text-[#B026FF] mb-2">
                  QUANTIDADE (1-50):
                </label>
                <input
                  type="number"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full bg-[#0A0E27] border-2 border-[#00D9FF] text-[#00D9FF] px-4 py-2 font-mono"
                  min="1"
                  max="50"
                  placeholder="Digite um número"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={handleResfriar}
                  className="neon-button text-sm md:text-base"
                >
                  RESFRIAR
                </button>
                <button
                  onClick={handleIgnorar}
                  className="neon-button-red text-sm md:text-base"
                >
                  IGNORAR
                </button>
                <button
                  onClick={handleFornecer}
                  className="neon-button-green text-sm md:text-base"
                >
                  FORNECER
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
}
