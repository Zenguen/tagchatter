(function (apiUrl) {
  function fetchParrotsCount() {
    return fetch(apiUrl + "/messages/parrots-count")
      .then(function (response) {
        return response.json();
      })
      .then(function (count) {
        document.getElementById("parrots-counter").innerHTML = count;
      });
  }

  const formatTime = date => {
    const time = new Date(date);
    return `${(time.getHours() < 10 ? "0" : "") + time.getHours()}:${(time.getMinutes() < 10 ? "0" : "") + time.getMinutes()}`;
  }

  const generateMessage = message => {
    const author = message.author;
    return `
			<div class="div_message">
				<div class="coluna_img">
			 		<img class="img_avatar" src="${author.avatar}"/> 
				</div>

				<div class="coluna_dados">
					<div class="cabecalho">
				  	<div class="author_name">
				    	${author.name} 
						</div>

						<div class="hora">
						 ${formatTime(message.created_at)}
						</div> 	

				 	 <img class="parrot ${(message.has_parrot ? "colorfulParrot" : "greyParrot")}" id="${message.id}" src="${message.has_parrot ? "./images/parrot.gif" : "./images/light-parrot.svg"}"/>
					 </div>
					 <div class="conteudo">
							 ${message.content}
				 	 </div>
				</div>
      </div>
    `;
  }


  function listMessages() {
    // Faz um request para a API de listagem de mensagens
    // Atualiza a o conteúdo da lista de mensagens
    // Deve ser chamado a cada 3 segundos
    fetch(apiUrl + "/messages")
      .then(response => response.json())
      .then(messages =>
        messages
          .map(generateMessage)
          .reduce((acc, message) => acc + message))
      .then(html => {
        document.querySelector("#messages").innerHTML = html;

        document.querySelectorAll(".parrot").forEach(element => 
          element.onclick = event => {
            const parrotElement = event.target;

            if(parrotElement.classList.contains("greyParrot")){
              parrotMessage(parrotElement.id);
							parrotElement.className = "parrot colorfulParrot"; 
							parrotElement.src = "./images/parrot.gif";

            } else {
              unparrotMessage(parrotElement.id);
							parrotElement.className = "parrot greyParrot"; 
							parrotElement.src = "./images/light-parrot.svg";
            }
          }
        )
      })
      .catch(error => console.log(error))
  }

  function parrotMessage(messageId) {
    // Faz um request para marcar a mensagem como parrot no servidor
    // Altera a mensagem na lista para que ela apareça como parrot na interface
    return fetch(`${apiUrl}/messages/${messageId}/parrot`, {      
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      method: "PUT"
    }).then(response =>{
      if(response.ok)
        fetchParrotsCount(messageId);
    });
  }

  function unparrotMessage(messageId) {
    return fetch(`${apiUrl}/messages/${messageId}/unparrot`, {      
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      method: "PUT"
    }).then(response => {
      if(response.ok) 
        fetchParrotsCount(messageId);
    });
  }

  function sendMessage(message, authorId) {
    // Manda a mensagem para a API quando o usuário envia a mensagem
    // Caso o request falhe exibe uma mensagem para o usuário utilizando Window.alert ou outro componente visual
    // Se o request for bem sucedido, atualiza o conteúdo da lista de mensagens
    return fetch(apiUrl + "/messages", {
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      method: "POST",
      body: JSON.stringify({ message: message, author_id: authorId })
    });
  }

  function getMe() {
    // Faz um request para pegar os dados do usuário atual
    // Exibe a foto do usuário atual na tela e armazena o seu ID para quando ele enviar uma mensagem
    return fetch(apiUrl + "/me")
      .then(response => response.json())
      .then(me => {
        document.getElementById("userImg").src = me.avatar;
        window.sessionStorage.setItem("tagChatterUserId", me.id);
        window.sessionStorage.setItem("tagChatterUserName", me.name);
        window.sessionStorage.setItem("tagChatterUserAvatar", me.avatar);
      })
      .catch(console.log);
  }

  function initialize() {
		fetchParrotsCount();
    setInterval(listMessages, 3000);
    getMe();

    document.querySelector(".send_icon").onclick = () => {
      const inputElement = document.querySelector(".input_text");
      const message = document.querySelector(".input_text").value;
      const authorId = window.sessionStorage.getItem("tagChatterUserId");
      sendMessage(message, authorId)
        .then(response => {
          if (response.ok) {
            listMessages();
            inputElement.value = "";
          } else {
            alert("Algo deu errado ;-;")
          }
        })
    }
  }

  initialize();
})("https://tagchatter.herokuapp.com");