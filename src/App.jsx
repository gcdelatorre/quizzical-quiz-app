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
        {q.allAnswers.map((ans) => (
          <button
            key={nanoid()}
            onClick={() => handleSelectAnswer(index, ans)}
          >{he.decode(ans)}</button>
        ))}
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
      {gameStarting && <>
        <div className="container">{gameStarting && questionAndAnswerElements}</div>

        {showScore &&<p>Score: {score}</p>}
        {gameStarting && 
        ( !showScore 
          ? <button onClick={handleCheckAnswer}>Check Answers</button>
          : <button onClick={handlePlayAgain}>Play Again</button>
        )
          }
      </>}
      
      {!gameStarting &&
      <>
      <h1>Quizzical</h1>
      <p>Answer the questions and test your knowledge!</p>

      <form onSubmit={handleSubmit}>
        <div className="select-category">
          <label>
            Category:
            <select name="category" defaultValue="">
              <option value="">Any Category</option>
              {categoryElements}
            </select>
          </label>
        </div>

        <div className="select-difficulty">
          <label>
            Difficulty:
            <select name="difficulty">
              <option value="">Any Difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </label>
        </div>

        <div className="select-type">
          <label>
            Type of questions:
            <select name="type">
              <option value="">Any Type</option>
              <option value="multiple">Multiple Choice</option>
              <option value="boolean">True or False</option>
            </select>
          </label>
        </div>

        <button type="submit">Start Quiz</button>
      </form>
      </>}

    </>
  );
}
