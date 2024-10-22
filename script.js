'use strict';

// BANKIST APP

// Data
const account1 = {
  owner: 'Bilbo Baggins',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Neymar Junior',
  movements: [51000, 7400, -150, -790, -3210, -1000, 825100, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Frodo Baggins',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Susi Britney',
  movements: [430, 1000, 700, 50, 90, -210, 2200],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

// creating a function that displays the movements in user interface - displayMovements, using forEach method (movement, index). Inside it, place the html set that represents movements__row, and reinsert the movements

const displayMovements = function (movements, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__value">${mov}€</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};
// calling the function with object/account set
displayMovements(account1.movements);

// Setting the balance (saldo)
const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, movement) => acc + movement, 0);
  labelBalance.textContent = `${acc.balance}€`;
};
// setting the summary (incomes, outcomes and interest)
const calcDisplaySum = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((val, mov) => val + mov, 0);
  labelSumIn.textContent = `${incomes} €`;

  const outcomes = acc.movements
    .filter(mov => mov < 0)
    .reduce((val, mov) => val + mov, 0);
  labelSumOut.textContent = `${Math.abs(outcomes)} €`;

  const interest = acc.movements
    .filter(mov => mov > 0) // filtering positive values
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      return i >= 1;
    }) // applying interest rate
    .reduce((val, int) => val + int, 0);
  labelSumInterest.textContent = `${interest} €`;
};
const createUserNames = function (accs) {
  // adding a new key (username) in each account object, consisting of their name initials
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
// joining all the initials

createUserNames(accounts);

const updateUI = function (acc) {
  // display - update account settings (movements, balance, etc)
  displayMovements(acc.movements);
  calcDisplayBalance(acc);
  calcDisplaySum(acc);
};

/////////////////////////////////////////////////
// Login Event Handler
let currentAccount;
btnLogin.addEventListener('click', function (e) {
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  // password
  if (currentAccount && currentAccount.pin === Number(inputLoginPin.value)) {
    labelWelcome.textContent = `Welcome, ${currentAccount.owner}.`;
  }
  containerApp.style.opacity = 100;

  // clearing input data
  inputLoginUsername.value = inputLoginPin.value = '';
  inputClosePin.blur();

  updateUI(currentAccount);
});
/////////////////////////////////////////////////
// Implementing transfers: start by adding eventListener on the 'formbtnTransfer element
btnTransfer.addEventListener('click', function (e) {
  // add preventDefault, declare a variable that stores transfer amount value, and other variable to the account receiver, pointed with .find method
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const accReceiver = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';
  console.log(currentAccount.movements, accReceiver.movements);

  if (
    currentAccount.balance >= amount &&
    accReceiver &&
    amount > 0 &&
    currentAccount?.username !== accReceiver.username
  ) {
    currentAccount.movements.push(-amount);
    accReceiver.movements.push(amount);
    // updating interface
    updateUI(currentAccount);

    // Valor da transferência > tirar da conta do depositante e adicionar na conta do depositário
  }
  alert('transfer sent to ' + accReceiver.owner);
});
// Implementing option to close account
btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    currentAccount.username === inputCloseUsername.value &&
    currentAccount.pin === Number(inputClosePin.value)
  ) {
    console.log('Botão de fechar conta');
    // delete current account using slice method
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    inputCloseUsername.value = inputClosePin.value = '';

    accounts.splice(index, 1);
    // uma vez que a conta for removida, a interface desaparece:
    containerApp.style.opacity = 0;

    labelWelcome.innerHTML = 'Your account has been closed';
    labelWelcome.style.color = 'red';
  }
});
// Request loan (solicitar empréstimo)

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Number(inputLoanAmount.value);

  // condicional - se alguma movimentação for maior ou igual a 10% do valor solicitado
  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    // adicionar a movimentação e atualizar UI com o valor solicitado
    currentAccount.movements.push(amount);
    updateUI(currentAccount);
  }
  inputLoanAmount.value = '';
});

// implementing the Sort button
let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});
