const messages = {
  pt: {
    translations: {
      signup: {
        title: "Registro",
        toasts: {
          success: "¡El usuario ha sido creado satisfactoriamente! ¡Ahora inicia sesión!",
          fail: "Error creando el usuario. Verifica la data reportada.",
        },
        form: {
          name: "Nombre",
          email: "Correo Electrónico",
          password: "Contraseña",
        },
        buttons: {
          submit: "Regístrate",
          login: "¿Ya tienes una cuenta? ¡Inicia sesión!",
        },
      },
      login: {
        title: "Inicio de Sesión",
        form: {
          email: "Correo Electrónico",
          password: "Contraseña",
        },
        buttons: {
          submit: "Ingresa",
          register: "Não tem um conta? Cadastre-se!",
        },
      },
      companies: {
        title: "Registrar Empresa",
        form: {
          name: "Nombre de Empresa",
          plan: "Plan",
          token: "Token",
          submit: "Registrar",
          success: "Empresa creada con éxito!",
        },
      },
      auth: {
        toasts: {
          success: "Inicio de sesión exitoso!",
        },
        token: "Token",
      },
      dashboard: {
        charts: {
          perDay: {
            title: "Tickets hoy: ",
          },
        },
      },
      connections: {
        title: "Conexiones",
        toasts: {
          deleted: "¡La conexión de WhatsApp ha sido borrada satisfactoriamente!",
        },
        confirmationModal: {
          deleteTitle: "Borrar",
          deleteMessage: "¿Estás seguro? Este proceso no puede ser revertido.",
          disconnectTitle: "Desconectar",
          disconnectMessage:
            "Estás seguro? Deberá volver a leer el código QR",
        },
        buttons: {
          add: "Agrega WhatsApp",
          disconnect: "desconectar",
          tryAgain: "Inténtalo de nuevo",
          qrcode: "QR CODE",
          newQr: "Nuevo QR CODE",
          connecting: "Conectando",
        },
        toolTips: {
          disconnected: {
            title: "No se pudo iniciar la sesión de WhatsApp",
            content:
              "Asegúrese de que su teléfono celular esté conectado a Internet y vuelva a intentarlo o solicite un nuevo código QR",
          },
          qrcode: {
            title: "Esperando la lectura del código QR",
            content:
              "Haga clic en el botón 'CÓDIGO QR' y lea el Código QR con su teléfono celular para iniciar la sesión",
          },
          connected: {
            title: "Conexión establecida!",
          },
          timeout: {
            title: "Se perdió la conexión con el teléfono celular",
            content:
              "Asegúrese de que su teléfono celular esté conectado a Internet y que WhatsApp esté abierto, o haga clic en el botón 'Desconectar' para obtener un nuevo código QR",
          },
        },
        table: {
          name: "Nombre",
          status: "Estado",
          lastUpdate: "Última Actualización",
          default: "Por Defecto",
          actions: "Acciones",
          session: "Sesión",
        },
      },
      whatsappModal: {
        title: {
          add: "Agrega WhatsApp",
          edit: "Edita WhatsApp",
        },
        form: {
          name: "Nombre",
          default: "Por Defecto",
        },
        buttons: {
          okAdd: "Agregar",
          okEdit: "Guardar",
          cancel: "Cancelar",
        },
        success: "WhatsApp guardado satisfactoriamente.",
      },
      qrCode: {
        message: "Lée el código QR para empezar la sesión",
      },
      contacts: {
        title: "Contactos",
        toasts: {
          deleted: "Contacto borrado satisfactoriamente!",
        },
        searchPlaceholder: "Buscar...",
        confirmationModal: {
          deleteTitle: "Borrar ",
          importTitlte: "Importar contactos",
          deleteMessage:
            "¿Estás seguro que deseas borrar este contacto? Todos los tickets relacionados se perderán.",
          importMessage: "¿Quieres importar todos los contactos desde tu teléfono?",
        },
        buttons: {
          import: "Importar Contactos",
          add: "Agregar Contacto",
        },
        table: {
          name: "Nombre",
          whatsapp: "WhatsApp",
          email: "Correo Electrónico",
          actions: "Acciones",
        },
      },
      contactModal: {
        title: {
          add: "Agregar contacto",
          edit: "Editar contacto",
        },
        form: {
          mainInfo: "Detalles del contacto",
          extraInfo: "Información adicional",
          name: "Nombre",
          number: "Número de Whatsapp",
          email: "Correo Electrónico",
          extraName: "Nombre del Campo",
          extraValue: "Valor",
        },
        buttons: {
          addExtraInfo: "Agregar información",
          okAdd: "Agregar",
          okEdit: "Guardar",
          cancel: "Cancelar",
        },
        success: "Contacto guardado satisfactoriamente.",
      },
      queueModal: {
        title: {
          add: "Agregar cola",
          edit: "Editar cola",
        },
        form: {
          name: "Nombre",
          color: "Color",
          greetingMessage: "Mensaje de saludo",
          complationMessage: "mensaje de finalización",
          outOfHoursMessage: "Mensaje fuera de horario",
          ratingMessage: "mensaje de evaluación",
          token: "Token",
        },
        buttons: {
          okAdd: "Añadir",
          okEdit: "Ahorrar",
          cancel: "Cancelar",
        },
      },
      userModal: {
        title: {
          add: "Agregar usuario",
          edit: "Editar usuario",
        },
        form: {
          name: "Nombre",
          email: "Correo Electrónico",
          password: "Contraseña",
          profile: "Perfil",
        },
        buttons: {
          okAdd: "Agregar",
          okEdit: "Guardar",
          cancel: "Cancelar",
        },
        success: "Usuario guardado satisfactoriamente.",
      },
      scheduleModal: {
        title: {
          add: "Nueva programación",
          edit: "Editar programación",
        },
        form: {
          body: "Mensaje",
          contact: "Contacto",
          sendAt: "Fecha de programacion",
          sentAt: "Fecha de envío",
        },
        buttons: {
          okAdd: "Agregar",
          okEdit: "Ahorrar",
          cancel: "Cancelar",
        },
        success: "guardada con éxito.",
      },
      tagModal: {
        title: {
          add: "Nueva etiqueta",
          edit: "Editar etiqueta",
        },
        form: {
          name: "Nombre",
          color: "Color",
        },
        buttons: {
          okAdd: "Agregar",
          okEdit: "Ahorrar",
          cancel: "Cancelar",
        },
        success: "etiqueta guardada con éxito.",
      },
      chat: {
        noTicketMessage: "Selecciona un ticket para empezar a chatear.",
      },
      ticketsManager: {
        buttons: {
          newTicket: "Nuevo",
        },
      },
      ticketsQueueSelect: {
        placeholder: "Linea",
      },
      tickets: {
        toasts: {
          deleted: "El ticket en el que estabas ha sido borrado.",
        },
        notification: {
          message: "Mensaje de",
        },
        tabs: {
          open: { title: "Bandeja" },
          closed: { title: "Resueltos" },
          search: { title: "Buscar" },
        },
        search: {
          placeholder: "Buscar tickets y mensajes",
        },
        buttons: {
          showAll: "Todos",
        },
      },
      transferTicketModal: {
        title: "Transferir Ticket",
        fieldLabel: "Escriba para buscar usuarios",
        fieldQueueLabel: "Transferir para fila",
        fieldQueuePlaceholder: "Selecione una fila",
        noOptions: "No se encontró ningún usuario con ese nombre",
        buttons: {
          ok: "Transferir",
          cancel: "Cancelar",
        },
      },
      ticketsList: {
        pendingHeader: "Cola",
        assignedHeader: "Trabajando en",
        noTicketsTitle: "Nada acá!",
        noTicketsMessage:
          "No se encontraron tickets con este estado o término de búsqueda",
        buttons: {
          accept: "Acceptar",
        },
      },
      newTicketModal: {
        title: "Crear Ticket",
        fieldLabel: "Escribe para buscar un contacto",
        add: "Añadir",
        buttons: {
          ok: "Guardar",
          cancel: "Cancelar",
        },
      },
      mainDrawer: {
        listItems: {
          dashboard: "Dashboard",
          connections: "Conexiones",
          tickets: "Tickets",
          quickMessages: "Respuestas Rápidas",
          contacts: "Contactos",
          queues: "Linhas",
          tags: "Etiquetas",
          administration: "Administración",
          users: "Usuarios",
          settings: "Configuración",
          helps: "Ayuda",
          messagesAPI: "API",
          schedules: "Horarios",
          campaigns: "Campañas",
          annoucements: "Boletines",
          chats: "Chat Interno",
        },
        appBar: {
          user: {
            profile: "Perfil",
            logout: "Cerrar Sesión",
          },
        },
      },
      messagesAPI: {
        title: "API",
        textMessage: {
          number: "Número",
          body: "Mensaje",
          token: "Token registrado",
        },
        mediaMessage: {
          number: "Número",
          body: "Nombre del archivo",
          media: "archivo",
          token: "Token registrado",
        },
      },
      notifications: {
        noTickets: "Sin notificaciones.",
      },
      quickMessages: {
        title: "Respuestas Rápidas",
        buttons: {
          add: "Nueva respuesta",
        },
        dialog: {
          shortcode: "Atajo",
          message: "Respuesta",
        },
      },
      contactLists: {
        title: "Listas de Contactos",
        table: {
          name: "Nombre",
          contacts: "Contactos",
          actions: "Comportamiento",
        },
        buttons: {
          add: "Nueva Lista",
        },
        dialog: {
          name: "Nombre",
          company: "Empresa",
          okEdit: "Editar",
          okAdd: "Agregar",
          add: "Agregar",
          edit: "Editar",
          cancel: "Cancelar",
        },
        confirmationModal: {
          deleteTitle: "Borrar",
          deleteMessage: "Esta acción no se puede revertir.",
        },
        toasts: {
          deleted: "registro eliminado",
        },
      },
      contactListItems: {
        title: "Contactos",
        searchPlaceholder: "Buscar",
        buttons: {
          add: "Nuevo",
          lists: "Listas",
          import: "Importar",
        },
        dialog: {
          name: "Nombre",
          number: "Número",
          whatsapp: "Whatsapp",
          email: "E-mail",
          okEdit: "Editar",
          okAdd: "Agregar",
          add: "Agregar",
          edit: "Editar",
          cancel: "Cancelar",
        },
        table: {
          name: "Nombre",
          number: "Número",
          whatsapp: "Whatsapp",
          email: "E-mail",
          actions: "Acciones",
        },
        confirmationModal: {
          deleteTitle: "Borrar",
          deleteMessage: "Esta acción no se puede revertir.",
          importMessage: "¿Desea importar contactos de esta hoja de cálculo? ",
          importTitlte: "Importar",
        },
        toasts: {
          deleted: "Registro borrado",
        },
      },
      campaigns: {
        title: "Campañas",
        searchPlaceholder: "Buscar",
        buttons: {
          add: "Nueva campaña",
          contactLists: "Listas de Contactos",
        },
        table: {
          name: "Nombre",
          whatsapp: "Conexión",
          contactList: "Lista de Contactos",
          status: "Status",
          scheduledAt: "Planificación",
          completedAt: "Terminado",
          confirmation: "Confirmación",
          actions: "Comportamiento",
        },
        dialog: {
          new: "Nueva campaña",
          update: "Editar campaña",
          readonly: "Sólo vista",
          form: {
            name: "Nombre",
            message1: "Mensaje 1",
            message2: "Mensaje 2",
            message3: "Mensaje 3",
            message4: "Mensaje 4",
            message5: "Mensaje 5",
            confirmationMessage1: "Mensaje de Confirmacion 1",
            confirmationMessage2: "Mensaje de Confirmacion 2",
            confirmationMessage3: "Mensaje de Confirmacion 3",
            confirmationMessage4: "Mensaje de Confirmacion 4",
            confirmationMessage5: "Mensaje de Confirmacion 5",
            messagePlaceholder: "Contenido del Mensaje",
            whatsapp: "Conexión",
            status: "Status",
            scheduledAt: "Planificación",
            confirmation: "Confirmación",
            contactList: "Lista de Contacto",
          },
          buttons: {
            add: "Agregar",
            edit: "Actualizar",
            okadd: "Ok",
            cancel: "Cancelar Disparos",
            restart: "Reiniciar Disparos",
            close: "Cerrar",
            attach: "Adjuntar archivo",
          },
        },
        confirmationModal: {
          deleteTitle: "Borrar",
          deleteMessage: "Esta acción no se puede revertir.",
        },
        toasts: {
          success: "Operación realizada con éxito",
          cancel: "Campaña cancelada",
          restart: "Campaña reiniciada",
          deleted: "registro eliminado",
        },
      },
      announcements: {
        title: "Boletines",
        searchPlaceholder: "Buscar",
        buttons: {
          add: "Nuevo boletín",
          contactLists: "Listas de boletines",
        },
        table: {
          priority: "Prioridad",
          title: "Title",
          text: "Texto",
          mediaName: "Archivo",
          status: "Status",
          actions: "Comportamiento",
        },
        dialog: {
          edit: "Edición de boletín",
          add: "Nuevo boletín",
          update: "Editar boletín",
          readonly: "Sólo vista",
          form: {
            priority: "Prioridad",
            title: "Title",
            text: "Texto",
            mediaPath: "Archivo",
            status: "Status",
          },
          buttons: {
            add: "Agregar",
            edit: "Actualizar",
            okadd: "Ok",
            cancel: "Cancelar",
            close: "Cerrar",
            attach: "Agregar Archivo",
          },
        },
        confirmationModal: {
          deleteTitle: "Borrar",
          deleteMessage: "Esta acción no se puede revertir.",
        },
        toasts: {
          success: "Operación realizada con éxito",
          deleted: "registro eliminado",
        },
      },
      campaignsConfig: {
        title: "Configuración de la campaña",
      },
      queues: {
        title: "lineas & Chatbot",
        table: {
          name: "Nombre",
          color: "Color",
          greeting: "Mensaje de saludo",
          actions: "Comportamiento",
        },
        buttons: {
          add: "Agregar cola",
        },
        confirmationModal: {
          deleteTitle: "Eliminar",
          deleteMessage:
            "¿Estás seguro? ¡Esta acción no se puede revertir! Los tickets en esa cola seguirán existiendo, pero ya no tendrán ninguna cola asignada.",
        },
      },
      queueSelect: {
        inputLabel: "lineas",
      },
      users: {
        title: "Usuarios",
        table: {
          name: "Nombre",
          email: "Correo Electrónico",
          profile: "Perfil",
          actions: "Acciones",
        },
        buttons: {
          add: "Agregar usuario",
        },
        toasts: {
          deleted: "Usuario borrado satisfactoriamente.",
        },
        confirmationModal: {
          deleteTitle: "Borrar",
          deleteMessage:
            "Toda la información del usuario se perderá. Los tickets abiertos de los usuarios se moverán a la cola.",
        },
      },
      helps: {
        title: "centro de ayuda",
      },
      schedules: {
        title: "Horarios",
        confirmationModal: {
          deleteTitle: "¿Está seguro de que desea eliminar este programa?",
          deleteMessage: "Esta acción no se puede revertir.",
        },
        table: {
          contact: "Contacto",
          body: "Mensaje",
          sendAt: "Fecha de programacion",
          sentAt: "Fecha de envio",
          status: "Status",
          actions: "Acciones",
        },
        buttons: {
          add: "Nueva programación",
        },
        toasts: {
          deleted: "eliminada con éxito.",
        },
      },
      tags: {
        title: "Etiquetas",
        confirmationModal: {
          deleteTitle: "¿Está seguro de que desea eliminar esta etiqueta?",
          deleteMessage: "Esta acción no se puede revertir..",
        },
        table: {
          name: "Nombre",
          color: "Color",
          tickets: "Registros etiquetados",
          actions: "Acciones",
        },
        buttons: {
          add: "Nueva etiqueta",
        },
        toasts: {
          deleted: "Etiqueta eliminada con éxito.",
        },
      },
      settings: {
        success: "Configuración guardada satisfactoriamente.",
        title: "Configuración",
        settings: {
          userCreation: {
            name: "Creación de usuarios",
            options: {
              enabled: "Habilitado",
              disabled: "Deshabilitado",
            },
          },
        },
      },
      messagesList: {
        header: {
          assignedTo: "Asignado a:",
          buttons: {
            return: "Devolver",
            resolve: "Resolver",
            reopen: "Reabrir",
            accept: "Aceptar",
          },
        },
      },
      messagesInput: {
        placeholderOpen: "Escribe un mensaje",
        placeholderClosed:
          "Vuelva a abrir o acepte este ticket para enviar un mensaje.",
        signMessage: "Firmar",
      },
      contactDrawer: {
        header: "Detalles del contacto",
        buttons: {
          edit: "Editar contacto",
        },
        extraInfo: "Otra información",
      },
      ticketOptionsMenu: {
        schedule: "Planificación",
        delete: "Borrar",
        transfer: "Transferir",
        registerAppointment: "Notas de contacto",
        appointmentsModal: {
          title: "Notas de contacto",
          textarea: "Observación",
          placeholder: "Ingresa los datos que deseas registrar aquí",
        },
        confirmationModal: {
          title: "Eliminar ticket de contacto",
          message:
            "¡Aviso! Todos los mensajes relacionados con el ticket se perderán",
        },
        buttons: {
          delete: "Borrar",
          cancel: "Cancelar",
        },
      },
      confirmationModal: {
        buttons: {
          confirm: "Ok",
          cancel: "Cancelar",
        },
      },
      messageOptionsMenu: {
        delete: "Borrar",
        reply: "Responder",
        confirmationModal: {
          title: "¿Borrar mensaje?",
          message: "Esta acción no puede ser revertida.",
        },
      },
      backendErrors: {
        ERR_NO_OTHER_WHATSAPP: "Debe haber al menos una conexión de WhatsApp predeterminada.",
        ERR_NO_DEF_WAPP_FOUND:
          "No se encontró WhatsApp predeterminado. Verifique la página de conexiones.",
        ERR_WAPP_NOT_INITIALIZED:
          "Esta sesión de WhatsApp no ​​está inicializada. Verifique la página de conexiones.",
        ERR_WAPP_CHECK_CONTACT:
          "No se pudo verificar el contacto de WhatsApp. Verifique la página de conexiones",
        ERR_WAPP_INVALID_CONTACT: "Este no es un número de whatsapp válido.",
        ERR_WAPP_DOWNLOAD_MEDIA:
          "No se pudieron descargar los medios de WhatsApp. Verifique la página de conexiones.",
        ERR_INVALID_CREDENTIALS:
          "Error de autenticación. Vuelva a intentarlo.",
        ERR_SENDING_WAPP_MSG:
          "Error al enviar el mensaje de WhatsApp. Verifique la página de conexiones.",
        ERR_DELETE_WAPP_MSG: "No se pudo borrar el mensaje de WhatsApp.",
        ERR_OTHER_OPEN_TICKET: "Ya hay un ticket abierto para este contacto.",
        ERR_SESSION_EXPIRED: "Sesión caducada. Inicie sesión.",
        ERR_USER_CREATION_DISABLED:
          "La creación de usuarios fue deshabilitada por el administrador.",
        ERR_NO_PERMISSION: "No tienes permiso para acceder a este recurso.",
        ERR_DUPLICATED_CONTACT: "Ya existe un contacto con este número.",
        ERR_NO_SETTING_FOUND: "No se encontró ninguna configuración con este ID.",
        ERR_NO_CONTACT_FOUND: "No se encontró ningún contacto con este ID.",
        ERR_NO_TICKET_FOUND: "No se encontró ningún ticket con este ID.",
        ERR_NO_USER_FOUND: "No se encontró ningún usuario con este ID.",
        ERR_NO_WAPP_FOUND: "No se encontró WhatsApp con este ID.",
        ERR_CREATING_MESSAGE: "Error al crear el mensaje en la base de datos.",
        ERR_CREATING_TICKET: "Error al crear el ticket en la base de datos.",
        ERR_FETCH_WAPP_MSG:
          "Error al obtener el mensaje en WhtasApp, tal vez sea demasiado antiguo.",
        ERR_QUEUE_COLOR_ALREADY_EXISTS:
          "Este color ya está en uso, elija otro.",
        ERR_WAPP_GREETING_REQUIRED:
          "El mensaje de saludo es obligatorio cuando hay más de una cola.",
      },
    },
  },
};

export { messages };
