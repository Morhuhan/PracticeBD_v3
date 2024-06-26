package PecticeBD.Controllers;

import org.postgresql.util.PSQLException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Map<String, String> sqlErrorMessages = new HashMap<>();

    static {
        sqlErrorMessages.put("23505", "Дублирование уникального значения.");
        sqlErrorMessages.put("23503", "Нарушение ограничения целостности данных (foreign key).");
        sqlErrorMessages.put("23502", "Нарушение ограничения NOT NULL.");
        sqlErrorMessages.put("23514", "Нарушение ограничения проверки (check constraint).");
        sqlErrorMessages.put("42501", "Нет прав на редактирование таблицы");
    }

    @ExceptionHandler(PSQLException.class)
    public ResponseEntity<Map<String, Object>> handleSQLException(SQLException e) {
        String errorCode = e.getSQLState();
        String errorMessage = sqlErrorMessages.getOrDefault(errorCode, "Ошибка базы данных: " + e.getMessage());

        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("error", errorMessage);
        responseBody.put("status", HttpStatus.BAD_REQUEST.value());

        return new ResponseEntity<>(responseBody, HttpStatus.BAD_REQUEST);
    }
}
