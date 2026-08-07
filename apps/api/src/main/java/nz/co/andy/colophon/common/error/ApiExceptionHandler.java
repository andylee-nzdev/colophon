package nz.co.andy.colophon.common.error;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.data.core.PropertyReferenceException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

/**
 * Renders errors as RFC 9457 problem details.
 *
 * <p>Extending {@link ResponseEntityExceptionHandler} means the framework's own failures
 * (unreadable JSON, unsupported media type, a malformed UUID in the path) already come
 * back as {@code application/problem+json}; only the application's own exceptions and the
 * field-level validation shape need adding.
 *
 * <p>Note that {@code spring.mvc.problemdetails.enabled} is deliberately left off — it
 * registers a competing advice for the same exceptions.
 */
@RestControllerAdvice
public class ApiExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    ProblemDetail handleNotFound(ResourceNotFoundException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        problem.setType(ProblemTypes.RESOURCE_NOT_FOUND);
        problem.setTitle("Resource not found");
        return problem;
    }

    @ExceptionHandler(SlugConflictException.class)
    ProblemDetail handleSlugConflict(SlugConflictException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, ex.getMessage());
        problem.setType(ProblemTypes.SLUG_CONFLICT);
        problem.setTitle("Slug already in use");
        problem.setProperty("slug", ex.getSlug());
        problem.setProperty("locale", ex.getLocale());
        return problem;
    }

    /** A concurrent create that lost the race against the (locale, slug) unique index. */
    @ExceptionHandler(DataIntegrityViolationException.class)
    ProblemDetail handleIntegrityViolation(DataIntegrityViolationException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.CONFLICT, "The request conflicts with the current state of the resource.");
        problem.setType(ProblemTypes.SLUG_CONFLICT);
        problem.setTitle("Conflict");
        return problem;
    }

    /** Someone else saved the post since this client loaded it. */
    @ExceptionHandler(OptimisticLockingFailureException.class)
    ProblemDetail handleStaleResource(OptimisticLockingFailureException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.CONFLICT, "The resource was modified by someone else. Reload and retry.");
        problem.setType(ProblemTypes.STALE_RESOURCE);
        problem.setTitle("Stale resource");
        return problem;
    }

    /** An unknown {@code ?sort=} property, which would otherwise surface as a 500. */
    @ExceptionHandler(PropertyReferenceException.class)
    ProblemDetail handleUnknownSortProperty(PropertyReferenceException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST, "Unknown sort property '%s'.".formatted(ex.getPropertyName()));
        problem.setType(ProblemTypes.INVALID_PARAMETER);
        problem.setTitle("Invalid parameter");
        return problem;
    }

    /**
     * Field-level bean validation. Overriding the base-class hook rather than adding an
     * {@code @ExceptionHandler} keeps a single handler for this exception.
     */
    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex,
            HttpHeaders headers,
            HttpStatusCode status,
            WebRequest request) {

        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST, "One or more fields are invalid.");
        problem.setType(ProblemTypes.VALIDATION_FAILED);
        problem.setTitle("Validation failed");
        problem.setProperty("errors", fieldErrors(ex));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(problem);
    }

    private static List<Map<String, String>> fieldErrors(MethodArgumentNotValidException ex) {
        return ex.getBindingResult().getFieldErrors().stream()
                .map(error -> Map.of(
                        "field", error.getField(),
                        "message", Objects.requireNonNullElse(error.getDefaultMessage(), "invalid")))
                .toList();
    }
}
