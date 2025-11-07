import { useState, useEffect, useMemo } from "react";
import { nanoid } from "nanoid";
import he from "he"

export default function App() {
  const [categories, setCategories] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [gameStarting, setGameStarting] = useState(false);
  const [select, setSelect] = useState();
  const [score, setScore] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showScore, setShowScore] = useState(false)


  useEffect(() => {
    if (!gameStarting) return;

    let url = "https://opentdb.com/api.php?amount=5";
    if (select?.category) url += `&category=${select.category}`;
    if (select?.difficulty) url += `&difficulty=${select.difficulty}`;
    if (select?.type) url += `&type=${select.type}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.results.map((q) => ({
          ...q,
          id: nanoid(),
          allAnswers: [...q.incorrect_answers, q.correct_answer].sort(
            () => Math.random() - 0.5
          ),
        }));
        setQuestions(formatted);
      })
      .catch((err) => console.error(err));
  }, [gameStarting, select]);

  useEffect(() => {
    fetch("https://opentdb.com/api_category.php")
      .then((res) => res.json())
      .then((data) => setCategories(data.trivia_categories))
      .catch((err) => console.error(err));
  }, []);

  const categoryElements = useMemo(() => 
    categories.map((cat) => (
      <option key={cat.id} value={cat.id}>
        {cat.name}
      </option>
    )), 
  [categories])

  function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const values = Object.fromEntries(formData.entries());
    const cleanValues = {
      category: values.category || null,
      difficulty: values.difficulty || null,
      type: values.type || null,
    };
    setSelect(cleanValues);
    setGameStarting(true);
  }

  function handleSelectAnswer(index, ans) {
    setSelectedAnswers((prev) => ({ ...prev, [index]: ans }));
  }

  function handleCheckAnswer() {
    let newScore = 0;
    questions.forEach((q, i) => {
      if (selectedAnswers[i] === q.correct_answer) {
        newScore++;
      }
    });
    setScore(newScore);
    setShowScore(true)
  }

  const questionAndAnswerElements = questions.map((q, index) => (
    <div key={q.id} className="question-block">
      <h3>{he.decode(q.question)}</h3>
      <ul className="answers-container">
        {q.allAnswers.map((ans) => {
          const isSelected = selectedAnswers[index] === ans;
          const isCorrect = ans === q.correct_answer;
          const classes = [];

          if (isSelected) {
            classes.push('selected', 'active');
          }

          if (showScore) {
            // show correct / incorrect after checking
            if (isCorrect) classes.push('correct');
            else if (isSelected && !isCorrect) classes.push('incorrect');
          }

          return (
            <button
              key={nanoid()}
              onClick={() => handleSelectAnswer(index, ans)}
              disabled={showScore}
              className={classes.join(' ')}
            >
              {he.decode(ans)}
            </button>
          );
        })}
      </ul>
    </div>
  ));

  function handlePlayAgain () {
    setQuestions([])
    setGameStarting(false)
    setScore(0)
    setShowScore(false)
    setSelectedAnswers({})
    setGameStarting(false)
  }

  return (
    <>
      {gameStarting ? (
        <>
          <div className="container">{questionAndAnswerElements}</div>

          {showScore ? (
            <div className="result-row">
              <p className="score">Score: {score}/5</p>
              <button className="play-btn" onClick={handlePlayAgain}>
                Play Again
              </button>
            </div>
          ) : (
            <button disabled={Object.keys(selectedAnswers).length !== questions.length}
            className="check-btn" onClick={handleCheckAnswer}>
              Check Answers
            </button>
          )}
        </>
      ) : (
        <div className="home-container">
          <h1>Quizzical</h1>
          <p>Answer the questions and test your knowledge!</p>

          <form onSubmit={handleSubmit}>
            <div className="select-category">
              <label>
                Category:  </label>
                <select name="category" defaultValue="">
                  <option value="">Any Category</option>
                  {categoryElements}
                </select>
             
            </div>

            <div className="select-difficulty">
              <label htmlFor="difficulty">Difficulty:</label>
              <select id="difficulty" name="difficulty">
                <option value="">Any Difficulty</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div className="select-type">
              <label htmlFor="type">Type of questions:</label>
              <select id="type" name="type">
                <option value="">Any Type</option>
                <option value="multiple">Multiple Choice</option>
                <option value="boolean">True or False</option>
              </select>
            </div>

            <button type="submit" className="start-btn">
              Start Quiz
            </button>
          </form>
        </div>
      )}
    </>
  );
}