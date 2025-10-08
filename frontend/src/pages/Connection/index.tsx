import { useState, useEffect } from 'react';

interface InstanceInfo {
  id: string;
  name: string;
  connectionStatus: string;
  integration: string;
  token: string;
}

export function Connection() {
  const [instanceName, setInstanceName] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [instances, setInstances] = useState<InstanceInfo[]>([]);

  const EVOLUTION_API_URL = 'http://localhost:8080';
  const API_KEY = 'minha-chave-super-secreta-123';

  const generateToken = () => {
    return 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX'.replace(/X/g, () => {
      return Math.floor(Math.random() * 16).toString(16).toUpperCase();
    });
  };

  const fetchInstances = async () => {
    try {
      const response = await fetch(`${EVOLUTION_API_URL}/instance/fetchInstances`, {
        headers: { 'apikey': API_KEY },
      });
      
      if (response.ok) {
        const data = await response.json();
        setInstances(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Erro ao buscar instâncias:', err);
    }
  };

  useEffect(() => {
    fetchInstances();
    const interval = setInterval(fetchInstances, 10000);
    return () => clearInterval(interval);
  }, []);

  const configureWebhook = async (instance: string, showMessage = false) => {
    try {
      console.log(`🔧 Configurando webhook para "${instance}"...`);
      
      const response = await fetch(`${EVOLUTION_API_URL}/webhook/set/${instance}`, {
        method: 'POST',
        headers: {
          'apikey': API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          webhook: {
            url: 'http://backend:8000/api/webhooks/evolution/',
            enabled: true,
            webhookByEvents: false,
            webhookBase64: false,
            events: [
                'CHATS_UPDATE',
                'MESSAGES_UPSERT',
                'MESSAGES_UPDATE'
            ]}
        }),
      });

      const responseData = await response.json();
      console.log('Webhook response:', responseData);

      if (response.ok) {
        console.log(`✅ Webhook configurado para "${instance}"`);
        if (showMessage) {
          setSuccess(`✅ Webhook configurado para "${instance}"!`);
        }
        return true;
      } else {
        console.error(`❌ Erro ao configurar webhook:`, responseData);
        return false;
      }
    } catch (err) {
      console.error('❌ Erro ao configurar webhook:', err);
      return false;
    }
  };

  const createInstance = async () => {
    if (!instanceName) {
      setError('Digite um nome para a instância');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setQrCode('');

    try {
      const response = await fetch(`${EVOLUTION_API_URL}/instance/create`, {
        method: 'POST',
        headers: {
          'apikey': API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instanceName: instanceName,
          integration: 'WHATSAPP-BAILEYS',
          token: generateToken(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.response?.message?.join(', ') || data.message || 'Erro ao criar instância');
      }

      const createdInstanceName = instanceName;
      setSuccess(`✅ Instância "${createdInstanceName}" criada!`);
      setInstanceName('');
      
      // Configurar webhook automaticamente (aguardar 2s para instância inicializar)
      setTimeout(async () => {
        console.log('Iniciando configuração de webhook...');
        const webhookOk = await configureWebhook(createdInstanceName);
        if (webhookOk) {
          setSuccess(`✅ Instância "${createdInstanceName}" criada e webhook configurado!`);
        } else {
          setError(`⚠️ Instância criada mas falha ao configurar webhook. Configure manualmente.`);
        }
        
        // Buscar QR Code (aguardar mais 1s)
        setTimeout(() => {
          fetchQRCode(createdInstanceName);
        }, 1000);
      }, 2000);

      fetchInstances();

    } catch (err) {
      setError(`❌ Erro: ${err instanceof Error ? err.message : 'Desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchQRCode = async (instance: string) => {
    setLoading(true);
    setQrCode('');

    try {
      const response = await fetch(`${EVOLUTION_API_URL}/instance/connect/${instance}`, {
        headers: { 'apikey': API_KEY },
      });

      const data = await response.json();

      if (data.base64) {
        setQrCode(data.base64);
        setSuccess(`📱 QR Code gerado para "${instance}"! Escaneie com WhatsApp.`);
      } else if (data.pairingCode) {
        setError(`Código de pareamento: ${data.pairingCode}`);
      } else {
        setError('QR Code não disponível. A instância pode já estar conectada.');
      }
    } catch (err) {
      setError(`❌ Erro ao buscar QR Code: ${err instanceof Error ? err.message : 'Desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  const checkConnection = async (instance: string) => {
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch(`${EVOLUTION_API_URL}/instance/connectionState/${instance}`, {
        headers: { 'apikey': API_KEY },
      });

      const data = await response.json();
      
      if (data.state === 'open') {
        setSuccess(`✅ Instância "${instance}" está conectada!`);
      } else {
        setError(`⚠️ Instância "${instance}" - Status: ${data.state || 'close'}`);
      }
    } catch (err) {
      setError(`❌ Erro: ${err instanceof Error ? err.message : 'Desconhecido'}`);
    }
  };

  const logoutInstance = async (instance: string) => {
    if (!confirm(`Tem certeza que deseja desconectar a instância "${instance}"?`)) {
      return;
    }

    try {
      const response = await fetch(`${EVOLUTION_API_URL}/instance/logout/${instance}`, {
        method: 'DELETE',
        headers: { 'apikey': API_KEY },
      });

      const data = await response.json();

      if (data.status === 'SUCCESS') {
        setSuccess(`✅ Instância "${instance}" desconectada!`);
        fetchInstances();
      } else {
        throw new Error('Erro ao desconectar');
      }
    } catch (err) {
      setError(`❌ Erro: ${err instanceof Error ? err.message : 'Desconhecido'}`);
    }
  };

  const deleteInstance = async (instance: string) => {
    const instanceData = instances.find(i => i.name === instance);
    if (instanceData?.connectionStatus === 'open') {
      setError('⚠️ Desconecte a instância antes de deletá-la!');
      return;
    }

    if (!confirm(`Tem certeza que deseja DELETAR PERMANENTEMENTE a instância "${instance}"?`)) {
      return;
    }

    try {
      const response = await fetch(`${EVOLUTION_API_URL}/instance/delete/${instance}`, {
        method: 'DELETE',
        headers: { 'apikey': API_KEY },
      });

      const data = await response.json();

      if (data.status === 'SUCCESS') {
        setSuccess(`✅ Instância "${instance}" deletada!`);
        fetchInstances();
        setQrCode('');
      } else {
        throw new Error('Erro ao deletar');
      }
    } catch (err) {
      setError(`❌ Erro: ${err instanceof Error ? err.message : 'Desconhecido'}`);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        📱 Conexão WhatsApp
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Instâncias Existentes</h2>
          <button
            onClick={fetchInstances}
            className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
          >
            🔄 Atualizar
          </button>
        </div>
        
        {instances.length === 0 ? (
          <p className="text-gray-500">Nenhuma instância criada ainda.</p>
        ) : (
          <div className="space-y-3">
            {instances.map((instance) => (
              <div key={instance.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${
                    instance.connectionStatus === 'open' ? 'bg-green-500 animate-pulse' : 
                    'bg-red-500'
                  }`}></div>
                  <div>
                    <div className="font-semibold">{instance.name}</div>
                    <div className="text-sm text-gray-500">
                      Status: {instance.connectionStatus} | {instance.integration}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {instance.connectionStatus === 'close' && (
                    <button
                      onClick={() => fetchQRCode(instance.name)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      disabled={loading}
                    >
                      📷 Conectar
                    </button>
                  )}
                  
                  {instance.connectionStatus === 'open' && (
                    <button
                      onClick={() => logoutInstance(instance.name)}
                      className="px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700"
                    >
                      🔌 Desconectar
                    </button>
                  )}
                  
                  <button
                    onClick={() => checkConnection(instance.name)}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                  >
                    ✓ Status
                  </button>
                  
                  <button
                    onClick={() => configureWebhook(instance.name, true)}
                    className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
                  >
                    🔗 Webhook
                  </button>
                  
                  <button
                    onClick={() => deleteInstance(instance.name)}
                    className={`px-3 py-1 text-white text-sm rounded ${
                      instance.connectionStatus === 'open'
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                    disabled={instance.connectionStatus === 'open'}
                    title={instance.connectionStatus === 'open' ? 'Desconecte antes de deletar' : 'Deletar instância'}
                  >
                    🗑️ Deletar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Criar Nova Instância</h2>
        
        <div className="flex gap-4">
          <input
            type="text"
            value={instanceName}
            onChange={(e) => setInstanceName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
            placeholder="nome_da_instancia"
            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            disabled={loading}
            onKeyPress={(e) => e.key === 'Enter' && createInstance()}
          />
          <button
            onClick={createInstance}
            disabled={loading || !instanceName}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? '⏳ Criando...' : '✨ Criar Instância'}
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          💡 O webhook será configurado automaticamente após criação
        </p>
      </div>

      {qrCode && (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">
            📱 Escaneie o QR Code com WhatsApp
          </h2>
          <img
            src={qrCode}
            alt="QR Code"
            className="mx-auto border-4 border-blue-500 rounded-lg shadow-lg mb-4"
            style={{ maxWidth: '400px' }}
          />
          <div className="bg-blue-50 p-4 rounded-lg text-left max-w-md mx-auto space-y-2">
            <p className="text-sm"><strong>1.</strong> Abra o WhatsApp no celular 📱</p>
            <p className="text-sm"><strong>2.</strong> Vá em Configurações → Aparelhos conectados ⚙️</p>
            <p className="text-sm"><strong>3.</strong> Toque em "Conectar um aparelho" 🔌</p>
            <p className="text-sm"><strong>4.</strong> Escaneie este QR Code 📷</p>
          </div>
          <button
            onClick={() => setQrCode('')}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Fechar QR Code
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">🔗 Links Úteis</h2>
        <div className="space-y-2">
          <p>
            <strong>Evolution API Manager:</strong>{' '}
            <a 
              href="http://localhost:8080/manager" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              http://localhost:8080/manager →
            </a>
          </p>
          <p className="text-sm text-gray-600 mt-3">
            ℹ️ <strong>Dicas:</strong>
          </p>
          <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
            <li>Webhook é configurado automaticamente ao criar instâncias</li>
            <li>Desconecte antes de deletar uma instância</li>
            <li>Use o botão "Webhook" para reconfigurar manualmente se necessário</li>
          </ul>
        </div>
      </div>
    </div>
  );
}