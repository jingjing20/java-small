package com.zhihao.admin.common.log;

import com.zhihao.admin.module.system.entity.SysOperLog;
import com.zhihao.admin.module.system.service.OperLogService;
import com.zhihao.admin.security.LoginUser;
import com.zhihao.admin.security.SecurityUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Aspect
@Component
@RequiredArgsConstructor
public class OperationLogAspect {

    private final OperLogService operLogService;

    @Around("@annotation(operationLog)")
    public Object around(ProceedingJoinPoint point, OperationLog operationLog) throws Throwable {
        long start = System.currentTimeMillis();
        SysOperLog log = buildLog(point, operationLog);
        try {
            Object result = point.proceed();
            log.setStatus(1);
            return result;
        } catch (Throwable ex) {
            log.setStatus(0);
            log.setErrorMessage(ex.getMessage());
            throw ex;
        } finally {
            log.setCostMillis(System.currentTimeMillis() - start);
            operLogService.record(log);
        }
    }

    private SysOperLog buildLog(ProceedingJoinPoint point, OperationLog operationLog) {
        SysOperLog log = new SysOperLog();
        MethodSignature signature = (MethodSignature) point.getSignature();
        log.setTitle(operationLog.title());
        log.setBusinessType(operationLog.businessType());
        log.setMethod(signature.getDeclaringTypeName() + "." + signature.getName());
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            log.setRequestMethod(request.getMethod());
            log.setRequestUri(request.getRequestURI());
            log.setOperatorIp(request.getRemoteAddr());
        }
        LoginUser user = SecurityUtils.currentUser();
        if (user != null) {
            log.setOperatorId(user.getUserId());
            log.setOperatorName(user.getUsername());
        }
        return log;
    }
}
