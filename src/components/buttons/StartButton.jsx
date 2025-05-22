import styles from "../MapContainer.module.css";

const StartButton = ({ onClick }) => (
  <button onClick={onClick} className={styles.runButton}>
    🏃 러닝 시작
  </button>
);

export default StartButton;