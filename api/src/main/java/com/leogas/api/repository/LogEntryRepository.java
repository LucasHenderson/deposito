package com.leogas.api.repository;

import com.leogas.api.entity.LogEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LogEntryRepository extends JpaRepository<LogEntry, Long> {
    List<LogEntry> findAllByOrderByDataDesc();
}
