/**
* This is the MVC pattern! 
* Model: Budget Controller
* View: UI Controller
* Controller: App Controller
* Model and View do NOT interact, and do not know of eachother
*/

var budgetController = (function() {
    
    var allExpenses = [];
    var allIncomes = [];
    var totalExpenses;
    
    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(curr) {
            sum += curr.value;
        });
        data.totals[type] = sum;
    };
    
    
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }
    
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
        
    };
    
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };
    
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    return {
        addItem: function(type, des, val) {
            var newItem, ID;
            
            // Creates new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            
            // Make new item based on inc or exp
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            
            // Add to data structure
            data.allItems[type].push(newItem);
            
            // Return the new element
            return newItem;
        },
        
        deleteItem: function(type, id) {
            var ids, index; 
            
            // gather the index of the given ID
            ids = data.allItems[type].map(function(current) {
               // map method creates a new array
                return current.id; 
            });
            
            index = ids.indexOf(id);
            
            // take out object from data structure
            if (index > -1) {
                // takes out one object at selected index
                data.allItems[type].splice(index, 1);
            }
            
        },
        
        calculateBudget: function() {
            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            
            // Calculate the budget
            data.budget = data.totals.inc - data.totals.exp;
            
            // Calculate the percentage of income spent
            data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100); 
        }, 
        
        calculatePercentages: function() {
            
            data.allItems.exp.forEach(function(curr) {
                curr.calcPercentage(data.totals.inc);
            });
            
        },
        
        getPercentages: function() {
            var allPercentages = data.allItems.exp.map(function(curr) {
                return curr.getPercentage();
            });
            return allPercentages;
        },
        
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        }
    };
    
    
})();


var UIController = (function() {
    
    //in case we change any class names
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentage: '.budget__expenses--percentage',
        container: '.container',
        expPercent: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    
    var formatNumber = function(num, type) {
            var numSpilt; 
            
            num = Math.abs(num);
            num = num.toFixed(2);
            
            numSplit = num.split('.');
            int_part = numSplit[0];
            
            if(int_part.length > 3) {
                int_part = int_part.substr(0, int_part.length - 3) + ',' + int_part.substr(int_part.length - 3, 3);  
            }
            
            dec_part = numSplit[1]; 
            
            return (type === 'exp' ? '-' : '+') + ' ' + int_part + '.' + dec_part;
        };
    
    var nodeListForEach = function(list, callback) {
                for (var i = 0; i < list.length; i++) {
                    callback(list[i], i);
                }
        };
    
    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value, description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
            
        },
        
        addListItem: function(obj, type) {
            var html, newHtml, element;
            // Create HTML string with placeholder text
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value"> %value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value"> %value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            
            // Replace placeholder text
            
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
            // Insert HTML into the DOM 
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
            
            
        },
        
        deleteListItem: function(selectorID) {
            var element = document.getElementById(selectorID);
            element.parentNode.removeChild(element);
            
        },
        
        clearFields: function() {
            var fields;
            
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            
            var fieldsArray = Array.prototype.slice.call(fields);
            
            fieldsArray.forEach(function(current, index, array) {
                current.value = "";
            });
            
            fieldsArray[0].focus();
            
        },
        
        displayBudget: function(obj) {
            
            document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMstrings.expenseLabel).textContent = obj.totalExp;
            document.querySelector(DOMstrings.percentage).textContent = obj.percentage;
            
            if (obj.percentage > 0 ) {
                document.querySelector(DOMstrings.percentage).textContent = obj.percentage + '%';
            
            } else {
                document.querySelector(DOMstrings.percentage).textContent = '---';
            }
            
        },
        
        displayPercentages: function(percentages) {
            
            var fields = document.querySelectorAll(DOMstrings.expPercent);
            
            
            nodeListForEach(fields, function(current, index) {
                
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '%';
                }
                
            });
            
        },
        
        displayMonth: function() {
            var now, year, month, months_names;
            now = new Date();
            
            months_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months_names[month] + ' ' + year;
        },
        
        changedType: function() {
            
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ', ' + 
                DOMstrings.inputDescription + ', ' +
                DOMstrings.inputValue);
            
            
            nodeListForEach(fields, function(curr) {
                curr.classList.toggle('red-focus');
            });
            
        },
        
        // exposed them to public so other functions can use it
        getDOMstrings: function() {
            return DOMstrings;
        }
        
    };
    
})();


var appController = (function(bgtCtrl, UICtrl) {
    var DOM = UICtrl.getDOMstrings();
    var setupEventListeners = function() {
       
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
    
        document.addEventListener('keypress', function(event) {
        
        if (event.keyCode === 13 || event.which === 13) {
            // all the same as above!
            ctrlAddItem();
        }
          
    });
        document.querySelector(DOM.container).addEventListener('click', ctrlDelItem);
        
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
};
    
    
    
    var updateBudget = function() {
        
        // 1. Calculate the budget
        bgtCtrl.calculateBudget();
        
        // 2. Return the budget
        var budget = bgtCtrl.getBudget();
        
        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);
        
    };
    
    var updatePercentages = function() {
        var percentages;
        // 1. Calculate
        bgtCtrl.calculatePercentages();
        // 2. Read percentages from budget controller
        percentages = bgtCtrl.getPercentages();
        // 3. Update the UI with new percentages 
        UICtrl.displayPercentages(percentages);
    }
    
    
    var ctrlAddItem = function() {
        var input, newItem;
        
        // 1. Get input data 
        input = UICtrl.getInput();
        
        if (input.description !== "" && input.value !== NaN && input.value > 0) {
            // 2. Add item to budget controller
            newItem = bgtCtrl.addItem(input.type, input.description, input.value);

            // 3. Add new item to UI then clear the fields
            UICtrl.addListItem(newItem, input.type);
            UICtrl.clearFields();

            // 4. Calculate the budget 
            updateBudget();
            updatePercentages();
            // 5. Display the budget
            
        }
        
    };
    
    var ctrlDelItem = function(event) {
        var itemID, splitID, type, id;
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if (itemID) {
            
            splitID = itemID.split('-');
            type = splitID[0];
            id = parseInt(splitID[1]);
            
            
            // 1. Delete item from the data struct
            bgtCtrl.deleteItem(type, id);
            
            // 2. Delete item from the UI
            UICtrl.deleteListItem(itemID);
            
            // 3. Update the budget and percentages 
            updateBudget();
            updatePercentages();
            
        }
        
    };
    
    return {
        init: function() {
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: 0
            });
            setupEventListeners();
        }
    };
    
})(budgetController, UIController);

appController.init();