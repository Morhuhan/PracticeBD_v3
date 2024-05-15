package PecticeBD.DAOs;

import PecticeBD.RowMappers.JsonNodeRowMapper;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.Getter;
import lombok.Setter;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Setter
@Getter
public class DAO {

    private JdbcTemplate jdbcTemplate;

    public DAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<String> getDataFromTable(JsonNode jsonNode) throws DataAccessException {
        String sql = "SELECT * FROM получить_страницу_из_таблицы(?::jsonb)";
        String jsonText = jsonNode.toString();
        return jdbcTemplate.queryForList(sql, String.class, jsonText);
    }

    public String addDataToTable(String tableName, JsonNode jsonNode) throws DataAccessException  {
        String jsonString = jsonNode.toString();
        String sql = "SELECT * FROM добавить_запись_в_таблицу(?, ?::jsonb)";
        return jdbcTemplate.queryForObject(sql, String.class, tableName, jsonString);
    }

    public List<String> getAllRecordsFromTable(String tableName) throws DataAccessException {
        String sql = "SELECT * FROM GetAllRecords(?)";
        return jdbcTemplate.queryForList(sql, String.class, tableName);
    }

    public String getExpandedData(JsonNode jsonNode) throws DataAccessException {
        String jsonText = jsonNode.toString();
        String sql = "SELECT * FROM получить_дополнительные_данные(?::jsonb)";
        return jdbcTemplate.queryForObject(sql, String.class, jsonText);
    }

    public int getDataCountFromTable(String tableName) throws DataAccessException {
        String sql = "SELECT получить_количество_записей(?)";
        return jdbcTemplate.queryForObject(sql, Integer.class, tableName);
    }

    public void editDataToTable(String tableName, JsonNode jsonNode) throws DataAccessException {
        String jsonString = jsonNode.toString();
        String sql = "CALL изменить_запись_в_таблице(?, ?::jsonb)";
        jdbcTemplate.update(sql, tableName, jsonString);
    }

    public void deleteDataFromTable(String tableName, JsonNode jsonNode) throws DataAccessException {
        String jsonString = jsonNode.toString();
        String sql = "CALL удалить_запись_из_таблицы(?, ?::jsonb)";
        jdbcTemplate.update(sql, tableName, jsonString);
    }

}