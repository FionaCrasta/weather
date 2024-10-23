// Create Rule
document.getElementById('createRuleBtn').addEventListener('click', async function() {
    const ruleString = document.getElementById('ruleString').value;
    const createRuleError = document.getElementById('createRuleError');
    createRuleError.innerText = '';

    try {
        const response = await fetch('/create_rule', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ruleString })
        });

        const result = await response.json();
        if (response.ok) {
            alert('Rule created successfully! Rule ID: ' + result.rule._id);
        } else {
            createRuleError.innerText = result.error;
        }
    } catch (error) {
        createRuleError.innerText = 'Failed to create rule: ' + error.message;
    }
});

// Evaluate Rule
document.getElementById('evaluateRuleBtn').addEventListener('click', async function() {
    const ruleId = document.getElementById('ruleId').value;
    const userData = {
        age: parseInt(document.getElementById('age').value, 10),
        department: document.getElementById('department').value,
        salary: parseFloat(document.getElementById('salary').value),
        experience: parseInt(document.getElementById('experience').value, 10)
    };
    const evaluationResult = document.getElementById('evaluationResult');
    const evaluationError = document.getElementById('evaluationError');
    evaluationResult.innerText = '';
    evaluationError.innerText = '';

    try {
        const response = await fetch('/evaluate_rule', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ruleId, data: userData })
        });

        const result = await response.json();
        if (response.ok) {
            evaluationResult.innerText = result.result ? 'Eligible' : 'Not Eligible';
        } else {
            evaluationError.innerText = result.error;
        }
    } catch (error) {
        evaluationError.innerText = 'Failed to evaluate rule: ' + error.message;
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // Example of animating the title
    gsap.from("h1", { duration: 1, y: -50, opacity: 0, ease: "power2.out" });

    // Animate the rule creation section
    gsap.from("div > h3", { duration: 1, x: -100, opacity: 0, stagger: 0.2 });

    //Animate class 
    gsap.to("rule1 rule2 rule3",{duration:2,x:200,ease:"power2.out"});

    // Add event listeners to buttons
    document.getElementById('createRuleBtn').addEventListener('click', () => {
        gsap.to("#createRuleError", { duration: 0.5, opacity: 1, y: -20 });
    });

    document.getElementById('evaluateRuleBtn').addEventListener('click', () => {
        gsap.to("#evaluationResult", { duration: 0.5, opacity: 1, y: -20 });
    });
});
