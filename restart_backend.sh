#!/bin/bash

echo "🛑 停止现有后端进程..."
pkill -f "AiAgentApplication" || echo "没有运行中的进程"
sleep 2

echo "🚀 启动后端..."
cd /Users/rvesper/Fitness_Ai/ELEC5620_SmartFitnessAiAssistance_/ai-agent-backend

export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home
export PATH=$JAVA_HOME/bin:$PATH

./gradlew bootRun > backend.log 2>&1 &

echo "⏳ 等待后端启动..."
sleep 15

echo "✅ 检查后端状态..."
curl -s http://localhost:8080/actuator/health || echo "⚠️  后端可能还在启动中,请等待30秒后刷新页面"

echo ""
echo "📝 查看日志: tail -f /Users/rvesper/Fitness_Ai/ELEC5620_SmartFitnessAiAssistance_/ai-agent-backend/backend.log"

