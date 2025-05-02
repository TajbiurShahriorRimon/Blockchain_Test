App = {
    loading: false,
    contracts: {},

    load: async () => {
        console.log("app loading...");
        await App.loadWeb3();
        await App.loadAccount();
        await App.loadContract();
        await App.render();
    },



    loadWeb3: async () => {
        if (typeof web3 !== 'undefined') {
          App.web3Provider = web3.currentProvider
          web3 = new Web3(web3.currentProvider)
        } else {
          window.alert("Please connect to Metamask.")
        }
        // Modern dapp browsers...
        if (window.ethereum) {
          window.web3 = new Web3(ethereum)
          try {
            // Request account access if needed
            await ethereum.enable()
            // Acccounts now exposed
            web3.eth.sendTransaction({/* ... */})
          } catch (error) {
            // User denied account access...
          }
        }
        // Legacy dapp browsers...
        else if (window.web3) {
          App.web3Provider = web3.currentProvider
          window.web3 = new Web3(web3.currentProvider)
          // Acccounts always exposed
          web3.eth.sendTransaction({/* ... */})
        }
        // Non-dapp browsers...
        else {
          console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
        }
    },

    // Old version of Web3.js
    loadAccount: async () => {
        App.account = web3.eth.accounts[0];
        console.log("Metamask Wallet address: " + App.account);
    },

    // ---new version Web3.js---
    // loadAccount: async () => {
    //     const accounts = await web3.eth.getAccounts();
    //     App.account = accounts[0];
    //     console.log(App.account);
    // }

    loadContract: async () => {
        const todoList = await $.getJSON('TodoList.json');
        App.contracts.TodoList = TruffleContract(todoList);
        App.contracts.TodoList.setProvider(App.web3Provider);
        // Manually set the address
        //App.todoList = await App.contracts.TodoList.at('0x381342ab49cc27a71dafcbef25f81da1e4505a53');

        console.log("todoList Data: ");
        console.log(todoList);
        
        // Hydrate the smart contract with values from the blockchain
        App.todoList = await App.contracts.TodoList.deployed();
        console.log("Smart contract deployed at address: " + App.todoList.address);
    },

    render: async () => {
        if(App.loading){
          return;
        }

        App.setLoading(true);

        //Render account
        $("#account").html(App.account);

        //Render Tasks
        await App.renderTask();

        //Update the loading state
        App.setLoading(false);
    },

    renderTask: async() => {
      //Load the total task count from the blockchain
      const taskCount = await App.todoList.taskCount();
      const $taskTemplate = $('.taskTemplate');
      console.log("hello1: "+ taskCount);


      for (var i = 1; i <= taskCount; i++) {
        console.log("hello2")
        // Fetch the task data from the database
        const task = await App.todoList.tasks(i);
        console.log("Data is here...");
        console.log("data: " + task);
        const taskId = task[0].toNumber();
        const taskContent = task[1];
        const taskCompleted = task[2];

        console.log("hi")
        console.log("Task ID: " + taskId + ", Task Content: " + taskContent + ", Task Completed: " + taskCompleted);

        // create the html for the task
        const $newTaskTemplate = $taskTemplate.clone();
        $newTaskTemplate.find('.content').html(taskContent)
        $newTaskTemplate.find('input')
                        .prop('name', taskId)
                        .prop('checked', taskCompleted)
                        //.on('click', App.toggleCompleted)

        // Put the task in the correct list
        if(taskCompleted){
          $('#completedTaskList').append($newTaskTemplate);
        }
        else{
          $('#taskList').append($newTaskTemplate)
        }

        //Show the task
        $newTaskTemplate.show();
      }      
    },

    setLoading: (boolean) => {
        App.loading = boolean;
        const loader = $('#loader');
        const content = $('#content');
        if(boolean) {
          loader.show();
          content.hide();
        }
        else{
          loader.hide();
          content.show();
        }
    }
}

$(() => {
    $(window).load(() => {
        App.load();
    })
})