#!/usr/bin/env bash
set -euo pipefail

# 默认拉取的模型（可改为 llama3.2、llama3.1:8b、qwen2.5:7b 等）
MODEL_NAME="${MODEL_NAME:-llama3.1}"

echo "=== 检测系统环境 ==="
OS="$(uname -s || true)"
ARCH="$(uname -m || true)"
echo "OS=${OS} ARCH=${ARCH}"

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "缺少依赖：$1，请先安装后重试。" >&2
    exit 1
  }
}

install_ollama_macos() {
  if command -v brew >/dev/null 2>&1; then
    echo "检测到 Homebrew，使用 brew 安装 Ollama..."
    brew install ollama || true
    echo "启动 Ollama 服务..."
    brew services start ollama || true
  else
    echo "未检测到 Homebrew，使用官方安装脚本安装 Ollama..."
    need_cmd curl
    curl -fsSL https://ollama.com/install.sh | sh
    echo "尝试以后台方式启动 Ollama..."
    nohup ollama serve >/tmp/ollama-serve.log 2>&1 &
  fi
}

install_ollama_linux() {
  echo "使用官方安装脚本安装 Ollama..."
  need_cmd curl
  curl -fsSL https://ollama.com/install.sh | sh

  if command -v systemctl >/dev/null 2>&1; then
    echo "检测到 systemd，启用并启动 Ollama 服务..."
    sudo systemctl enable ollama || true
    sudo systemctl start ollama || true
  else
    echo "未检测到 systemd，使用后台进程方式启动 Ollama..."
    nohup ollama serve >/tmp/ollama-serve.log 2>&1 &
  fi
}

case "${OS}" in
  Darwin)
    install_ollama_macos ;;
  Linux)
    install_ollama_linux ;;
  MINGW*|MSYS*|CYGWIN*)
    echo "检测到 Windows Shell。请使用 WSL（Ubuntu 等）运行此脚本，或前往 https://ollama.com 下载 Windows 安装包。"
    exit 1 ;;
  *)
    echo "暂不支持的系统：${OS}，请参考 https://ollama.com 手动安装。"
    exit 1 ;;
esac

echo "=== 验证安装 ==="
if ! command -v ollama >/dev/null 2>&1; then
  echo "未检测到 ollama 命令，安装可能失败，请检查上方日志。" >&2
  exit 1
fi

echo "Ollama 版本：$(ollama --version || echo '未知')"

echo "等待 Ollama 服务启动..."
for i in $(seq 1 30); do
  if curl -fsS http://localhost:11434/api/tags >/dev/null 2>&1; then
    echo "Ollama 服务已就绪。"
    break
  fi
  sleep 1
  if [ "$i" -eq 30 ]; then
    echo "Ollama 服务未在预期时间内就绪，仍继续尝试拉取模型。" >&2
  fi
done

echo "=== 拉取模型: ${MODEL_NAME} ==="
ollama pull "${MODEL_NAME}"

echo "=== 快速测试（一次对话）==="
set +e
RESP="$(curl -s -X POST http://localhost:11434/api/chat \
  -H 'Content-Type: application/json' \
  -d "$(command -v jq >/dev/null 2>&1 && jq -n --arg m "$MODEL_NAME" '{model:$m, messages:[{role:"user", content:"你好，用一句话介绍你自己"}]}')" 2>/dev/null)"
set -e

if command -v jq >/dev/null 2>&1; then
  echo "$RESP" | jq -r '.message.content // .messages[0].content // .response // empty' | sed -e 's/^/> /'
else
  echo "$RESP" | sed -e 's/^/RAW> /'
fi

cat <<'EOF'

安装完成！
- 服务地址: http://localhost:11434
- 常用命令:
  - 启动服务(前台):  ollama serve
  - 拉取模型:        ollama pull llama3.1
  - 交互运行:        ollama run llama3.1
  - 列出模型:        ollama list
- 可通过环境变量指定默认模型：
  MODEL_NAME=llama3.2 ./install_ollama.sh

EOF

