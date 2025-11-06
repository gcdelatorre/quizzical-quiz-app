import { useState, useEffect, useRef} from "react"
import { nanoid } from "nanoid"


export default function App () {
  const [categories, setCategories] = useState([])
  const [questions, setQuestions] = useState([])
  const [gameStarting, setGameStarting] = useState(false)
  const [select, setSelect] = useState()
  const [correctCount, setCorrectCount] = useState(0)

  const hasFetched = useRef(false);

    useEffect(() => {
      if (!gameStarting || hasFetched.current) return;
      hasFetched.current = true;

      let url = "https://opentdb.com/api.php?amount=5"
      if (select.category) { url += `&category=${select.category}`}
      if (select.difficulty) { url += `&difficulty=${select.difficulty}`}
      if (select.type) { url += `&type=${select.type}`}

      fetch(url)
        .then(res => res.json())
        .then(data => setQuestions(data.results))
        .catch(err => console.error(err))
    }, [gameStarting, select])

      console.log(questions)

    useEffect(() => {
      fetch("https://opentdb.com/api_category.php")
        .then(res => res.json())
        .then(data => setCategories(data.trivia_categories))
        .catch(err => console.error(err))
    }, [])

    const categoryElements = categories.map(cat => {
      return (
        <option key={nanoid()} value={cat.id} name={cat.name}>{cat.name}</option>
      )
    })

  // Handle form submission
    function handleSubmit(e) {
      e.preventDefault() // stop page reload

      const formData = new FormData(e.target)
      const values = Object.fromEntries(formData.entries())

      // Optional: treat empty strings as null
      const cleanValues = {
        category: values.category || null,
        difficulty: values.difficulty || null,
        type: values.type || null
      }

      setSelect(cleanValues)
      setGameStarting(true) // you can use this to trigger question fetching later
    }

    function handleCheckAnswer () {
      
    }

    const questionAndAnswerElements = questions.map(q => {
      const allAnswers = [...q.incorrect_answers, q.correct_answer].sort(() => Math.random() - 0.5)

      return (
        <div key={nanoid()} className="question-block">
          <h3 dangerouslySetInnerHTML={{ __html: q.question }} />
          <ul className="answers-container">
            {allAnswers.map(ans => (
              <button key={nanoid()} dangerouslySetInnerHTML={{ __html: ans }} />
            ))}
          </ul>
        </div>
      )
    })
    
  return (
    <>
      <h1>Quizzical</h1>
      <p>Answer the questions and test your knowledge!</p>
      
      <form onSubmit={handleSubmit}>
          <div className="select-category">
            <label htmlFor="category"> Category:
              <select name="category" id="category" defaultValue="Any Category">
                <option value="">Any Category</option>
                {categoryElements}
              </select>
            </label>
          </div>

          <div className="select-difficulty">
            <label htmlFor="difficulty"> Difficulty:
              <select name="difficulty" id="difficulty">
                <option value="" name="difficulty">Any Difficulty</option>
                <option value="easy" name="difficulty">Easy</option>
                <option value="medium" name="difficulty">Medium</option>
                <option value="hard" name="difficulty">Hard</option>
              </select>
            </label>
          </div>

          <div className="select-type">
            <label htmlFor="type"> Type of questions:
              <select name="type" id="type">
                <option value="" name="type">Any Type</option>
                <option value="multiple" name="type">Multiple Choice</option>
                <option value="boolean" name="type">True or Flase</option>
              </select>
            </label>
          </div>

          <button type="submit">Start Quiz</button>
      </form>



      <div className="container">
        {gameStarting && questionAndAnswerElements}
      </div>

        {gameStarting && <button>Check Answers</button>}
    </>
  )
}