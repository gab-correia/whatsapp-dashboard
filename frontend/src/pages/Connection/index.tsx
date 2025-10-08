import { useState, useEffect } from 'react';
import styles from './Connection.module.css';

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
      <div className={styles.header}>
        <h1 className={styles.title}>Conexão WhatsApp</h1>
      </div>

      {error && (
        <div className={`${styles.alert} ${styles.alertError}`}>
          {error}
        </div>
      )}

      {success && (
        <div className={`${styles.alert} ${styles.alertSuccess}`}>
          {success}
        </div>
      )}

      {/* Instâncias Existentes */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Instâncias Existentes</h2>
          <button
            onClick={fetchInstances}
            className={`${styles.button} ${styles.buttonSecondary}`}
          >
            🔄 Atualizar
          </button>
        </div>
        
        {instances.length === 0 ? (
          <div className={styles.emptyState}>
            Nenhuma instância criada ainda.
          </div>
        ) : (
          <div className={styles.instancesList}>
            {instances.map((instance) => (
              <div key={instance.id} className={styles.instanceItem}>
                <div className={styles.instanceInfo}>
                  <div className={`${styles.statusDot} ${
                    instance.connectionStatus === 'open' ? styles.statusOnline : styles.statusOffline
                  }`}></div>
                  <div className={styles.instanceDetails}>
                    <div className={styles.instanceName}>{instance.name}</div>
                    <div className={styles.instanceMeta}>
                      Status: {instance.connectionStatus} | {instance.integration}
                    </div>
                  </div>
                </div>
                <div className={styles.instanceActions}>
                  {instance.connectionStatus === 'close' && (
                    <button
                      onClick={() => fetchQRCode(instance.name)}
                      className={`${styles.button} ${styles.buttonPrimary}`}
                      disabled={loading}
                    >
                      📷 Conectar
                    </button>
                  )}
                  
                  {instance.connectionStatus === 'open' && (
                    <button
                      onClick={() => logoutInstance(instance.name)}
                      className={`${styles.button} ${styles.buttonWarning}`}
                    >
                      🔌 Desconectar
                    </button>
                  )}
                  
                  <button
                    onClick={() => checkConnection(instance.name)}
                    className={`${styles.button} ${styles.buttonSuccess}`}
                  >
                    ✓ Status
                  </button>
                  
                  {/* <button
                    onClick={() => configureWebhook(instance.name, true)}
                    className={`${styles.button} ${styles.buttonPurple}`}
                  >
                    🔗 Webhook
                  </button> */}
                  
                  <button
                    onClick={() => deleteInstance(instance.name)}
                    className={`${styles.button} ${styles.buttonDanger}`}
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

      {/* Criar Nova Instância */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Criar Nova Instância</h2>
        
        <div className={styles.inputGroup}>
          <input
            type="text"
            value={instanceName}
            onChange={(e) => setInstanceName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
            placeholder="nome_da_instancia"
            className={styles.input}
            disabled={loading}
            onKeyPress={(e) => e.key === 'Enter' && createInstance()}
          />
          <button
            onClick={createInstance}
            disabled={loading || !instanceName}
            className={`${styles.button} ${styles.buttonPrimary}`}
          >
            {loading ? '⏳ Criando...' : '✨ Criar Instância'}
          </button>
        </div>
        <p className={styles.inputHint}>
          💡 O webhook será configurado automaticamente após criação
        </p>
      </div>

      {/* QR Code */}
      {qrCode && (
        <div className={`${styles.card} ${styles.qrSection}`}>
          <h2 className={styles.qrTitle}>
            📱 Escaneie o QR Code com WhatsApp
          </h2>
          <img
            src={qrCode}
            alt="QR Code"
            className={styles.qrImage}
          />
          <div className={styles.qrInstructions}>
            <p className={styles.qrStep}><strong>1.</strong> Abra o WhatsApp no celular 📱</p>
            <p className={styles.qrStep}><strong>2.</strong> Vá em Configurações → Aparelhos conectados ⚙️</p>
            <p className={styles.qrStep}><strong>3.</strong> Toque em "Conectar um aparelho" 🔌</p>
            <p className={styles.qrStep}><strong>4.</strong> Escaneie este QR Code 📷</p>
          </div>
          <button
            onClick={() => setQrCode('')}
            className={`${styles.button} ${styles.buttonSecondary}`}
          >
            Fechar QR Code
          </button>
        </div>
      )}

      {/* Links Úteis */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>🔗 Links Úteis</h2>
        <div className={styles.linksSection}>
          <p>
            <strong>Evolution API Manager:</strong>{' '}
            <a 
              href="http://localhost:8080/manager" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.link}
            >
              http://localhost:8080/manager →
            </a>
          </p>
          <div className={styles.linksList}>
            <p><strong>ℹ️ Dicas:</strong></p>
            <ul>
              <li>Webhook é configurado automaticamente ao criar instâncias</li>
              <li>Desconecte antes de deletar uma instância</li>
              <li>Use o botão "Webhook" para reconfigurar manualmente se necessário</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}