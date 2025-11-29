export const shouldShowQuestion = (rules, answersSoFar) => {
    if (!rules || !rules.conditions || rules.conditions.length === 0) {
        return true;
    }

    const { logic, conditions } = rules;

    const results = conditions.map(condition => {
        const { questionKey, operator, value } = condition;
        const answer = answersSoFar[questionKey];

        if (answer === undefined || answer === null) {
            return false;
        }

        switch (operator) {
            case 'equals':
                return answer == value; // Loose equality to handle string/number differences
            case 'notEquals':
                return answer != value;
            case 'contains':
                if (Array.isArray(answer)) {
                    return answer.includes(value);
                }
                return String(answer).includes(String(value));
            default:
                return false;
        }
    });

    if (logic === 'OR') {
        return results.some(result => result);
    } else {
        // Default to AND
        return results.every(result => result);
    }
};
