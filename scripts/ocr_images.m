#import <AppKit/AppKit.h>
#import <Foundation/Foundation.h>
#import <Vision/Vision.h>

static NSString *escapeJSON(NSString *value) {
  NSMutableString *result = [NSMutableString stringWithString:value ?: @""];
  [result replaceOccurrencesOfString:@"\\" withString:@"\\\\" options:0 range:NSMakeRange(0, result.length)];
  [result replaceOccurrencesOfString:@"\"" withString:@"\\\"" options:0 range:NSMakeRange(0, result.length)];
  [result replaceOccurrencesOfString:@"\n" withString:@"\\n" options:0 range:NSMakeRange(0, result.length)];
  [result replaceOccurrencesOfString:@"\r" withString:@"\\r" options:0 range:NSMakeRange(0, result.length)];
  [result replaceOccurrencesOfString:@"\t" withString:@"\\t" options:0 range:NSMakeRange(0, result.length)];
  return result;
}

int main(int argc, const char * argv[]) {
  @autoreleasepool {
    if (argc < 2) {
      fprintf(stderr, "Usage: ocr_images <image...>\n");
      return 2;
    }

    for (int i = 1; i < argc; i++) {
      NSString *path = [NSString stringWithUTF8String:argv[i]];
      NSImage *image = [[NSImage alloc] initWithContentsOfFile:path];
      CGImageRef cgImage = [image CGImageForProposedRect:NULL context:nil hints:nil];
      if (cgImage == nil) {
        printf("{\"path\":\"%s\",\"error\":\"could_not_load\"}\n", [escapeJSON(path) UTF8String]);
        continue;
      }

      VNRecognizeTextRequest *request = [[VNRecognizeTextRequest alloc] init];
      request.recognitionLevel = VNRequestTextRecognitionLevelAccurate;
      request.usesLanguageCorrection = YES;
      request.recognitionLanguages = @[@"ru-RU", @"en-US"];

      VNImageRequestHandler *handler = [[VNImageRequestHandler alloc] initWithCGImage:cgImage options:@{}];
      NSError *error = nil;
      BOOL ok = [handler performRequests:@[request] error:&error];
      if (!ok || error != nil) {
        printf("{\"path\":\"%s\",\"error\":\"%s\"}\n", [escapeJSON(path) UTF8String], [escapeJSON([error localizedDescription] ?: @"ocr_failed") UTF8String]);
        continue;
      }

      NSMutableArray<NSString *> *lines = [NSMutableArray array];
      for (VNRecognizedTextObservation *observation in request.results) {
        VNRecognizedText *candidate = [[observation topCandidates:1] firstObject];
        if (candidate.string.length > 0) {
          [lines addObject:candidate.string];
        }
      }

      NSString *joined = [lines componentsJoinedByString:@"\n"];
      printf("{\"path\":\"%s\",\"text\":\"%s\"}\n", [escapeJSON(path) UTF8String], [escapeJSON(joined) UTF8String]);
    }

    return 0;
  }
}
