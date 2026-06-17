#!/bin/zsh
# ============================================================
#  CambioReal — macOS Launcher
#  Duplo-clique neste ficheiro no Finder para lançar o app.
# ============================================================

# -- Cores para o terminal --
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo ""
echo "${CYAN}${BOLD}============================================${NC}"
echo "${CYAN}${BOLD}   💱  CambioReal — Iniciando...           ${NC}"
echo "${CYAN}${BOLD}============================================${NC}"
echo ""

# -- Ir para a pasta onde este script está --
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# --------------------------------------------------------
# 1. Verificar se o Homebrew está instalado
# --------------------------------------------------------
if ! command -v brew &>/dev/null; then
  echo "${YELLOW}⚠️  Homebrew não encontrado. A instalar...${NC}"
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  # Adicionar brew ao PATH para sessão actual (Apple Silicon e Intel)
  if [ -f "/opt/homebrew/bin/brew" ]; then
    eval "$(/opt/homebrew/bin/brew shellenv)"
  elif [ -f "/usr/local/bin/brew" ]; then
    eval "$(/usr/local/bin/brew shellenv)"
  fi
else
  echo "${GREEN}✅  Homebrew já instalado.${NC}"
fi

# --------------------------------------------------------
# 2. Verificar / Instalar Node.js
# --------------------------------------------------------
if ! command -v node &>/dev/null; then
  echo "${YELLOW}⚠️  Node.js não encontrado. A instalar via Homebrew...${NC}"
  brew install node
else
  NODE_VER=$(node -v)
  echo "${GREEN}✅  Node.js ${NODE_VER} já instalado.${NC}"
fi

# --------------------------------------------------------
# 3. Instalar dependências npm do projecto
# --------------------------------------------------------
echo ""
echo "${CYAN}📦  A instalar dependências do projecto...${NC}"
npm install

if [ $? -ne 0 ]; then
  echo "${RED}❌  Erro ao instalar dependências. Verifica a ligação à internet.${NC}"
  read -p "Pressiona Enter para fechar..."
  exit 1
fi

echo "${GREEN}✅  Dependências instaladas com sucesso.${NC}"

# --------------------------------------------------------
# 4. Abrir o browser automaticamente (aguarda servidor)
# --------------------------------------------------------
echo ""
echo "${CYAN}🚀  A lançar o servidor de desenvolvimento...${NC}"
echo "${CYAN}    O browser vai abrir em http://localhost:5173${NC}"
echo ""

# Aguarda 3 segundos e abre o browser
(sleep 3 && open "http://localhost:5173") &

# --------------------------------------------------------
# 5. Iniciar o servidor (bloqueia o terminal)
# --------------------------------------------------------
npm run dev

# Se o servidor fechar, aguarda input antes de fechar a janela
echo ""
echo "${YELLOW}Servidor encerrado. Pressiona Enter para fechar esta janela.${NC}"
read
