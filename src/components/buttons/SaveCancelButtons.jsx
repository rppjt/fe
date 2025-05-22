import styles from "../MapContainer.module.css";

const SaveCancelButtons = ({ onSave, onCancel }) => (
  <div className={styles.buttonGroup}>
    <button onClick={onSave}>저장하기</button>
    <button onClick={onCancel}>취소하기</button>
  </div>
);

export default SaveCancelButtons;