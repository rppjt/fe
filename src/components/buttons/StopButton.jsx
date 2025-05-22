import styles from "../MapContainer.module.css";

const StopButton = ({ onClick }) => (
  <button onClick={onClick} className={styles.stopButton}>
    🛑 러닝 종료
  </button>
);

export default StopButton;