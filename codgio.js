// 📄 Constantes da planilha
const PLANILHA_ID = "1SCSIAF0lPHH9UShJF7x6k8w-CmHWiGyaxAeaVIvHxg4";
const SHEET_DADOS = "Respostas ao formulário 1";
const SHEET_RESULTADOS = "Jogos_2025";

// 🌐 WebApp principal (index e resultados)
function doGet(e) {
  // Sempre retorna index.html, pois resultados serão exibidos na mesma página
  return HtmlService.createHtmlOutputFromFile("index");
}

// 👤 Lista de jogadores únicos da aba de dados (ano 2025)
function getJogadores() {
  const sheet = SpreadsheetApp.openById(PLANILHA_ID).getSheetByName(SHEET_DADOS);
  const dados = sheet.getDataRange().getValues();
  const jogadores = new Set();

  for (let i = 1; i < dados.length; i++) {
    const nome = dados[i][1]; // Coluna B
    const data = parseDateString(dados[i][2]); // Coluna C - Usar parseDateString

    if (nome && !isNaN(data) && data.getFullYear() === 2025) {
      jogadores.add(nome.trim());
    }
  }

  return Array.from(jogadores).sort();
}

// Helper para parsear string de data (dd/MM/yyyy ou objeto Date) para objeto Date
function parseDateString(dateValue) {
  if (dateValue instanceof Date) { // Se já é um objeto Date, retorna
      return dateValue;
  }
  if (typeof dateValue === 'string' && dateValue.includes('/')) { // Formato dd/MM/yyyy
    const parts = dateValue.split('/');
    // new Date(year, monthIndex, day, hour, minute, second) - Forçando meio-dia GMT-3
    return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]), 12, 0, 0);
  }
  // Tenta parsear qualquer outra coisa (ex: ISO string do frontend)
  return new Date(dateValue);
}

// ⚽ Registrar jogada de um jogador
function registrarJogada(dados) {
  const aba = SpreadsheetApp.openById(PLANILHA_ID).getSheetByName(SHEET_DADOS);

  // A data já vem do frontend como ISO string (ex: '2025-06-03T15:00:00.000Z')
  // Forçar para o fuso horário da planilha (GMT-3) e formatar para dd/MM/yyyy
  const dataObjeto = new Date(dados.data); // Cria objeto Date a partir da ISO string
  const dataFormatadaParaSheet = Utilities.formatDate(dataObjeto, SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone(), "dd/MM/yyyy");

  // A estrutura da novaLinha deve corresponder às colunas da sua planilha.
  // Baseado na imagem e na sua solicitação de manter a ordem E: Assistência, F: Gols na planilha
  // e tornar o 'Time' opcional no formulário.
  // Colunas: A (Carimbo), B (Jogador), C (Data), D (Presença), E (Assistência), F (Gols), G (Última Datas), H (Capitão), P (Time)
  
  const novaLinha = [
    new Date(),                      // A: Carimbo UTC
    dados.jogador || "",             // B: Jogador
    dataFormatadaParaSheet,          // C: Data do Jogo (dd/MM/yyyy)
    "Presente",                      // D: Presença
    dados.assist || 0,               // E: Assistência (valor vem do combo box)
    dados.gols || 0,                 // F: Gols (valor vem do combo box)
    "Última",                        // G: Última Datas (manter ou remover se não usa)
    dados.capitao ? "Sim" : "Não"    // H: Capitão
  ];

  // Preencher as colunas intermediárias (I até O) com vazio para manter a estrutura até a coluna P
  // (A é a 1ª coluna, P é a 16ª coluna, então precisamos de 16 elementos no array)
  while (novaLinha.length < 15) { // Chega até a coluna O (índice 14)
    novaLinha.push("");
  }
  
  // Adiciona o Time na coluna P (índice 15)
  novaLinha.push(dados.time || ""); // Time do jogador (agora opcional no frontend)

  aba.appendRow(novaLinha);
  return "✅ Jogada registrada com sucesso!";
}

// 📊 Registrar uma partida completa (mantida inalterada)
function registrarPartida(partida) {
  const ss = SpreadsheetApp.openById(PLANILHA_ID);
  let aba = ss.getSheetByName(SHEET_RESULTADOS);

  if (!aba) {
    aba = ss.insertSheet(SHEET_RESULTADOS);
    aba.appendRow(["Data do Jogo", "Time 1", "Gols Time 1", "Time 2", "Gols Time 2"]);
  }

  const dataObjeto = new Date(partida.data); // Cria objeto Date a partir da ISO string
  const dataFormatadaParaSheet = Utilities.formatDate(dataObjeto, SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone(), "dd/MM/yyyy");

  aba.appendRow([
    dataFormatadaParaSheet,
    partida.time1,
    partida.gols1,
    partida.time2,
    partida.gols2
  ]);

  return "✅ Partida registrada com sucesso!";
}

// Helper para formatar data para comparação (yyyy-MM-dd)
function formatarDataParaComparacao(data) {
  let d = data;
  if (!(data instanceof Date)) {
    d = parseDateString(data); 
  }
  return Utilities.formatDate(d, Session.getScriptTimeZone(), "yyyy-MM-dd");
}

// 🆕 Função para obter estatísticas completas (jogadores e times)
function getEstatisticasCompletas(dataFiltro) {
  const ss = SpreadsheetApp.openById(PLANILHA_ID);
  const sheetDados = ss.getSheetByName(SHEET_DADOS);
  const sheetResultados = ss.getSheetByName(SHEET_RESULTADOS);

  const jogadoresStats = {}; // Para gols, assistências, presença, capitaoCount
  const timesPontos = {"T1": 0, "T2": 0, "T3": 0, "T4": 0}; // Para pontos dos times
  const jogosDoDia = [];

  // Processar dados dos jogadores
  if (sheetDados) {
    const dadosJogadores = sheetDados.getDataRange().getValues();
    for (let i = 1; i < dadosJogadores.length; i++) {
      const linha = dadosJogadores[i];
      const jogador = linha[1]; // Coluna B
      const dataJogada = parseDateString(linha[2]); // Coluna C
      const assist = parseInt(linha[4]) || 0; // Coluna E (Assistência)
      const gols = parseInt(linha[5]) || 0; // Coluna F (Gols)
      const capitao = linha[7] === "Sim"; // Coluna H

      // Filtrar por data, se fornecida
      if (dataFiltro && formatarDataParaComparacao(dataJogada) !== formatarDataParaComparacao(dataFiltro)) {
        continue;
      }

      if (!jogadoresStats[jogador]) {
        jogadoresStats[jogador] = { gols: 0, assist: 0, presencas: 0, capitaoCount: 0 };
      }
      jogadoresStats[jogador].gols += gols;
      jogadoresStats[jogador].assist += assist;
      jogadoresStats[jogador].presencas += 1;
      if (capitao) {
        jogadoresStats[jogador].capitaoCount += 1;
      }
    }
  }

  // Processar resultados dos jogos e calcular pontos
  if (sheetResultados) {
    const dadosResultados = sheetResultados.getDataRange().getValues();
    for (let i = 1; i < dadosResultados.length; i++) {
      const linha = dadosResultados[i];
      const dataJogo = parseDateString(linha[0]); // Coluna A

      // Filtrar por data, se fornecida
      if (dataFiltro && formatarDataParaComparacao(dataJogo) !== formatarDataParaComparacao(dataFiltro)) {
        continue;
      }

      const time1 = linha[1];
      const gols1 = parseInt(linha[2]) || 0;
      const time2 = linha[3];
      const gols2 = parseInt(linha[4]) || 0;

      jogosDoDia.push({ time1, gols1, time2, gols2 });

      // Calcular pontos
      if (gols1 > gols2) {
        timesPontos[time1] = (timesPontos[time1] || 0) + 3;
      } else if (gols2 > gols1) {
        timesPontos[time2] = (timesPontos[time2] || 0) + 3;
      } else {
        timesPontos[time1] = (timesPontos[time1] || 0) + 1;
        timesPontos[time2] = (timesPontos[time2] || 0) + 1;
      }
    }
  }

  // Determinar time campeão do dia (se houver)
  let timeCampeao = "N/A";
  let maxPontos = -1;

  // Filtrar times com 0 pontos para não considerar no campeão
  const timesComPontos = Object.keys(timesPontos).filter(time => timesPontos[time] > 0);

  if (timesComPontos.length > 0) {
    maxPontos = Math.max(...timesComPontos.map(time => timesPontos[time]));
    const campeoesPotenciais = timesComPontos.filter(time => timesPontos[time] === maxPontos);

    if (campeoesPotenciais.length === 1) {
      timeCampeao = campeoesPotenciais[0];
    } else {
      timeCampeao = "Empate";
    }
  } else {
    timeCampeao = "Nenhum ponto registrado";
  }

  return {
    jogadores: jogadoresStats,
    times: timesPontos,
    timeCampeao: timeCampeao,
    jogos: jogosDoDia
  };
}

// 📅 Buscar resultados de uma data específica (agora usa getEstatisticasCompletas)
function getResultadosPorData(dataString) {
  const data = parseDateString(dataString);
  Logger.log(`[getResultadosPorData] Data recebida como string: ${dataString}`);
  Logger.log(`[getResultadosPorData] Data convertida para Date: ${data}`);
  return getEstatisticasCompletas(data);
}

// 📅 Função para resultados do dia (chamada por resultados.html, também usa getEstatisticasCompletas)
function getResultadosDoDia(dataString) {
  const data = parseDateString(dataString);
  Logger.log(`[getResultadosDoDia] Data recebida como string: ${dataString}`);
  Logger.log(`[getResultadosDoDia] Data convertida para Date: ${data}`);
  return getEstatisticasCompletas(data);
}


// 🛠️ Funções de debug
function listarAbas() {
  const planilha = SpreadsheetApp.openById(PLANILHA_ID);
  planilha.getSheets().forEach(s => Logger.log(s.getName()));
}

function testarGetJogadores() {
  const jogadores = getJogadores();
  Logger.log(jogadores);
}

function obterResultados() {
  const aba = SpreadsheetApp.openById(PLANILHA_ID).getSheetByName("Jogos_2025");
  const dados = aba.getDataRange().getValues();

  const cabecalho = dados[0];
  const linhas = dados.slice(1).filter(row => row[0]); // Ignora vazias

  return linhas.map(row => {
    const item = {};
    cabecalho.forEach((col, i) => {
      item[col] = row[i];
    });
    return item;
  });
}
function testarResultadosHoje() {
  const FN = "🧪 [testarResultadosHoje]";
  console.log(`${FN} ✅ Teste iniciado para resultados do dia`);

  const hoje = new Date();
  const hojeFormatado = Utilities.formatDate(hoje, Session.getScriptTimeZone(), "yyyy-MM-dd");

  console.log(`${FN} 📅 Data de hoje em formato ISO:`, hojeFormatado);

  const resultados = getEstatisticasCompletas(hoje); // Usando getEstatisticasCompletas

  console.log(`${FN} 📦 Resultado retornado da função getEstatisticasCompletas:`, resultados);

  if (!resultados || !resultados.jogos || resultados.jogos.length === 0) { // Verifica a nova estrutura
    console.log(`${FN} 🔍 Nenhum resultado encontrado para hoje.`);
  } else {
    console.log(`${FN} ✅ Foram encontrados ${resultados.jogos.length} jogos.`);
  }
}