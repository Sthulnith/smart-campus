package com.smartcampus.backend;
<<<<<<< HEAD

=======
import io.github.cdimascio.dotenv.Dotenv;
>>>>>>> fix/32-fix-main-branch
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
<<<<<<< HEAD
=======
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
>>>>>>> fix/32-fix-main-branch
		SpringApplication.run(BackendApplication.class, args);
	}

}
