import { useContacts } from '../../hooks/useContacts';

export function Contacts() {
  const { contacts, loading, error } = useContacts();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600">Carregando contatos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Contatos
        </h1>
        <div className="text-sm text-gray-600">
          Total: {contacts.length} contatos
        </div>
      </div>

      {contacts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Nenhum contato ainda
          </h3>
          <p className="text-gray-500">
            Os contatos aparecerão quando mensagens forem recebidas
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contacts.map((contact) => (
            <div key={contact.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {contact.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {contact.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {contact.phone_number}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {contact.total_messages}
                  </div>
                  <div className="text-xs text-gray-500">Mensagens</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">
                    {contact.last_message_at ? (
                      new Date(contact.last_message_at).toLocaleDateString('pt-BR')
                    ) : (
                      'Sem mensagens'
                    )}
                  </div>
                  <div className="text-xs text-gray-500">Última msg</div>
                </div>
              </div>

              {contact.is_blocked && (
                <div className="mt-4">
                  <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                    Bloqueado
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}