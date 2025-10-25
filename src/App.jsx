import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(
    parseInt(localStorage.getItem("score")) || 0
  );
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [timer, setTimer] = useState(15);

  // Fetch categories once
  useEffect(() => {
    fetch("https://opentdb.com/api_category.php")
      .then((res) => res.json())
      .then((data) => setCategories(data.trivia_categories))
      .catch((err) => console.error(err));
  }, []);

  // Fetch questions when category is selected
  useEffect(() => {
    if (selectedCategory) {
      setLoading(true);
      fetch(
        `https://opentdb.com/api.php?amount=5&category=${selectedCategory}&type=multiple`
      )
        .then((res) => res.json())
        .then((data) => {
          const formatted = data.results.map((item) => {
            const options = [...item.incorrect_answers];
            const randomIndex = Math.floor(Math.random() * 4);
            options.splice(randomIndex, 0, item.correct_answer);
            return {
              question: item.question,
              options,
              answer: item.correct_answer,
            };
          });
          setQuestions(formatted);
          setCurrent(0);
          setShowResult(false);
          setScore(0);
          localStorage.removeItem("score");
          setLoading(false);
          setTimer(15);
        });
    }
  }, [selectedCategory]);

  // Countdown timer
  useEffect(() => {
    if (!showResult && questions.length > 0) {
      const countdown = setInterval(() => {
        setTimer((prev) => {
          if (prev === 1) {
            handleNext();
            return 15;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(countdown);
    }
  }, [questions, current, showResult]);

  const handleAnswer = (option) => {
    if (selectedAnswer) return; // prevent double click
    setSelectedAnswer(option);

    if (option === questions[current].answer) {
      setScore((prev) => {
        const newScore = prev + 1;
        localStorage.setItem("score", newScore);
        return newScore;
      });
    }
  };

  const handleNext = () => {
    setSelectedAnswer("");
    setTimer(15);
    const next = current + 1;
    if (next < questions.length) {
      setCurrent(next);
    } else {
      setShowResult(true);
    }
  };

  const restartQuiz = () => {
    setSelectedCategory("");
    setQuestions([]);
    setCurrent(0);
    setScore(0);
    setShowResult(false);
    setTimer(15);
    localStorage.removeItem("score");
  };

  return (
    <div className="quiz-container">
      <h1>Advanced Quiz App 🧠</h1>

      {!selectedCategory && (
        <div>
          <h2>Select a Category 🎯</h2>
          <select
            onChange={(e) => setSelectedCategory(e.target.value)}
            defaultValue=""
          >
            <option value="" disabled>
              Choose category
            </option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {loading && <h2>Loading questions... 🌀</h2>}

      {!loading && selectedCategory && questions.length > 0 && !showResult && (
        <div>
          <div className="timer">⏱️ Time left: {timer}s</div>
          <h2
            dangerouslySetInnerHTML={{
              __html: `${current + 1}. ${questions[current].question}`,
            }}
          />

          {questions[current].options.map((option, index) => {
            const isCorrect = option === questions[current].answer;
            const isSelected = option === selectedAnswer;
            let className = "option-btn";
            if (selectedAnswer) {
              if (isSelected && isCorrect) className = "option-btn correct";
              else if (isSelected && !isCorrect) className = "option-btn wrong";
            }
            return (
              <button
                key={index}
                className={className}
                onClick={() => handleAnswer(option)}
                dangerouslySetInnerHTML={{ __html: option }}
              />
            );
          })}

          {selectedAnswer && (
            <button className="next-btn" onClick={handleNext}>
              Next ➡️
            </button>
          )}

          <p className="progress">
            Question {current + 1} of {questions.length}
          </p>
        </div>
      )}

      {showResult && (
        <div>
          <p className="result">
            🏁 Your Final Score: {score}/{questions.length}
          </p>
          <button className="restart-btn" onClick={restartQuiz}>
            Restart Quiz 🔄
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
