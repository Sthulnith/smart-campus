package com.smartcampus.backend;
import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		Dotenv dotenv = Dotenv.configure()
				.ignoreIfMissing()
				.load();
		dotenv.entries().forEach(entry -> {
			String key = entry.getKey();
			if (System.getProperty(key) != null) {
				return;
			}
			if (System.getenv(key) != null) {
				return;
			}
			System.setProperty(key, entry.getValue());
		});
		SpringApplication.run(BackendApplication.class, args);
	}

}
